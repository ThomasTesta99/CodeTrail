'use server'
import { NextRequest, NextResponse } from 'next/server';
import {OpenAI} from 'openai'

const openAi = new OpenAI({apiKey: process.env.OPENAI_API_KEY!});

export async function POST(req: NextRequest){
    try {
        const {
            code, 
            notes, 
            questionTitle, 
            questionDescription, 
            language, 
            neededHelp, 
            durationMinutes, 
            allAttempts
        } = await req.json()

        if(!code || !questionTitle){
            return NextResponse.json({error: 'Missing required fields'}, {status: 400});
        }

        let prompt = `You are an expert coding assistant. A user attempted the following leetcode question: 
            Title: ${questionTitle}
            Description: ${questionDescription || 'N/A'}
            
            They submitted the following code (in ${language}):
            ${code}
            
            Notes from user: ${notes || 'None'}
            Time spent: ${durationMinutes || 'unknown'} minutes
            Marked as needing help: ${neededHelp ? 'Yes' : 'No'}`;

        if(allAttempts){
            prompt += `\nThe user also had multiple attempts:
            ${JSON.stringify(allAttempts, null, 2)}\n`
        }

        prompt += '\nPlease provide constructive feedback on this attempt. Focus on where the user may be going wrong, how they could improve, and what they could try differently. Be supportive and specific.';
    
        const completion = await openAi.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {role: 'system', content: 'You are a helpful and friendly coding assistant'},
                {role: 'user', content: prompt}
            ],
            temperature: 0.7
        });

        const response = completion.choices[0].message.content;
        return NextResponse.json({feedback: response});
    
    } catch (error) {
        console.log(error);
        return NextResponse.json({error : 'Error'});
    }
}