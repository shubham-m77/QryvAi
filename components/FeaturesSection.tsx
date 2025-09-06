import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { features } from "@/data/features"
import grainImg from "@/assets/grain.jpg";
export const FeaturesSection = () => {
    return (
        <section className="w-full bg-background py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6  flex flex-col items-center justify-center">
                <h2 className="text-2xl relative md:text-3xl font-bold tracking-tight text-center mb-12 ">Powerful Features For Optimizing Career
                    <svg className="w-[300px] md:w-[100%] absolute top-8 left-50% md:top-0"
                        width={'100%'}
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


                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 max-w-6xl justify-center items-center">
                    {
                        features?.map((feature, index) => (
                            <Card key={index} className="border-2  hover:border-primary transition-colors duration-300 text-center">
                                <div className="absolute inset-0 opacity-5 -z-10" style={{ backgroundImage: `url(${grainImg.src})` }} ></div>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center" >
                                        {feature.icon}
                                        <h3 className="text-lg font-semibold mt-2">{feature.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                        )}
                </div>
            </div>
        </section>
    )
}
