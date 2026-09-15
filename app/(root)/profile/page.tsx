import Profile from '@/components/Profile';
import {getUserSession } from '@/lib/user-actions/authActions';

const page = async () => {
    const session = await getUserSession();

    if (!session?.user) {
        return (
            <div>
                <h1>Not logged in</h1>
            </div>
        );
    }

    const user = session.user;

    return (
        <Profile user={user} />
    );
};

export default page;