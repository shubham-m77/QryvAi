// 'use client'
import React, { Suspense } from 'react'
import { PropagateLoader, ScaleLoader } from 'react-spinners'

export default function InterviewLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="px-5 mt-24">
            <div className="flex items-center justify-between mb-5">
                <h1 className="text-5xl font-bold gradient-title">Industry Insights</h1>
            </div>
            <Suspense
                fallback={
                    <div className="mt-5 w-full min-h-screen flex justify-center">
                        <ScaleLoader color="gray" />
                    </div>
                }
            >
                {children}
            </Suspense>
        </div>
    )
}
