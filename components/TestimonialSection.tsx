import React from 'react'
import { testimonial } from "@/data/testimonial.js"
import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import grainImg from "@/assets/grain.jpg";


const TestimonialSection = () => {
    return (
        <section className="w-full bg-background/50 py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6  flex flex-col items-center justify-center">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">What User's Say
                        <svg className="absolute top-0 left-50% "
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
                    </h2>
                </div>
                <div className="flex flex-wrap  gap-6 p-6 max-w-6xl justify-center items-center">
                    {
                        testimonial?.map((item, idx) => (
                            <Card key={idx} className='backdrop-blur-md max-w-[350px]'>
                                <div className="absolute inset-0 opacity-5 -z-10" style={{ backgroundImage: `url(${grainImg.src})` }} ></div>
                                <CardContent className=''>
                                    <div className='flex gap-x-4 items-center mb-3'>
                                        <Image src={item.image} width={12} height={12} className='size-12 outline-1 outline-background object-contain rounded-full' alt={item.author} />
                                        <div className='flex flex-col '>
                                            <p className='font-semibold text-[16px]'>{item.author}</p>
                                            <p className='text-sm text-gray-500'>{item.role}</p>
                                            <p className='font-medium text-[14px]'>{item.company}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-base text-gray-400'>
                                            {item.quote}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    }

                </div>
            </div>
        </section>
    )
}

export default TestimonialSection
