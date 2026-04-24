import { getResume } from '@/actions/resume'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ResumeBuilder from './_components/resume-builder';

const ResumePage = async () => {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/sign-in');
    }
    const resume = await getResume();
    const userName = session.user?.name ?? 'Resume'

    return (
        <div className='container mx-auto'>
            <ResumeBuilder initialContent={resume?.content ?? ''} userName={userName} />
        </div>
    )
}

export default ResumePage