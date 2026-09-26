import AddQuestionForm from '@/components/AddQuestionForm'
import { getUserSession } from '@/lib/user-actions/authActions';

const page = async () => {
  const session = await getUserSession();
  const user = session?.user;

  return (
    <div>
      <AddQuestionForm user = {user}/>
    </div>
  )
}

export default page
