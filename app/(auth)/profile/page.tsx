"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
const ProfilePage = () => {
    const { data: session, status } = useSession()
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/sign-in');
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className='flex flex-col items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md min-h-screen w-[90%] mt-16'>
                <p className='text-white'>Loading profile...</p>
            </div>
        )
    }

    if (!session) {
        return null;
    }

    return (
        <div className='flex flex-col items-center justify-center p-6 bg-slate-900/20 backdrop-blur-md min-h-screen w-[90%] mt-16'>
            <h1 className='text-3xl font-bold'>User Profile</h1>
            <p className='text-gray-600'>Manage your account settings and preferences here.</p>
        </div>
    )
}
export default ProfilePage
