import { Action } from '@/types/types';
import arcjet, { fixedWindow, request } from '@arcjet/next'

const aj = arcjet({
    key: process.env.ARCJET_API_KEY!,
    rules: [],
})

export default aj;

export const validateWithArcjet = async (fingerprint: string, action: Action) => {
    const rateLimit = aj.withRule(
        fixedWindow({
            mode: 'LIVE',
            window: '3m', 
            max: 2,
            characteristics: [action]
        })
    )

    const req = await request()

    const decision = await rateLimit.protect(req, {
        [action]: fingerprint
    } as Record<Action, string>);

    if(decision.isDenied()){
        return {
            valid: false, 
            message: "Rate Limit Exceeded"
        }
    }else{
        return {
            valid: true,
            message: ' ',
        }
    }

}