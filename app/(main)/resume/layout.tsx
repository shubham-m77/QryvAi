// 'use client'
import React, { Suspense } from 'react'
import { PropagateLoader } from 'react-spinners'

export default function ResumeLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="">
            <Suspense
                fallback={
                    <div className="mt-5 w-full min-h-screen flex justify-center">
                        <PropagateLoader color="gray" />
                    </div>
                }
            >
                {children}
            </Suspense>
        </div>
    )
}
