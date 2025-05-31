import QuestionDetails from '@/components/QuestionDetails';
import { fakeQuestions } from '@/constants'
import React from 'react'

const page = ({params} : {params: {id: string}}) => {
    const question = fakeQuestions.find((question) => question.id === params.id);

    if(!question){
        return <div className="p-6 text-red">Question not found.</div>
    }
  return (
    <div className='p-6 max-w-4xl'>
        <QuestionDetails question={question}/>
    </div>

  )
}

export default page
