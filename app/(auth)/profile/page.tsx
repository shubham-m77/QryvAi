"use client";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
const ProfilePage = () => {
    const { data: session } = useSession()
    const router = useRouter();
    if (!session) {
        return router.push('/sign-in');
    }
    return (
        <div className='flex flex-col items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md min-h-screen w-[90%]'>
            <h1 className='text-3xl font-bold'>User Profile</h1>
            <p className='text-gray-600'>Manage your account settings and preferences here.</p>
        </div>
    )
}
export default ProfilePage
