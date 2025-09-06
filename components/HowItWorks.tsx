import React from 'react'
import { howItWorks } from "@/data/howItWorks.js"

const HowItWorks = () => {
    return (
        <section className="w-full bg-background py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6  flex flex-col items-center justify-center">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-1 relative">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center ">Powerful Features For Optimizing Career
                    </h2>
                    <p className='text-gray-500'>
                        Here are some simple steps to accelate ur career growth.
                    </p>
                    <svg className="absolute top-20 md:top-8 left-50% "
                        width="100%"
                        height="80"
                        viewBox="0 0 500 80"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="dividerStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                                <stop offset="20%" stopColor="#60a5fa" stopOpacity="0.7" />
                                <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8" />
                                <stop offset="80%" stopColor="#f472b6" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        <path
                            d="M 0 40 Q 125 30 250 40 Q 375 50 500 40"
                            fill="none"
                            stroke="url(#dividerStroke)"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 max-w-6xl justify-center items-center">
                    {
                        howItWorks?.map((work, idx) => (
                            <div key={idx} className="flex rounded-2xl bg-slate-800/10 backdrop-blur p-8 flex-col items-center justify-center space-y-4">
                                <div className="rounded-full size-14 bg-primary/10 backdrop-blur-md flex items-center justify-center">{work.icon}</div>
                                <div className='text-center space-y-2'>
                                    <h3 className='text-xl font-semibold'>{work.title}</h3>
                                    <p className='text-gray-500 text-center text-sm'>{work.description}</p>
                                </div>
                            </div>
                        ))
                    }

                </div>
            </div>
        </section>
    )
}

export default HowItWorks
