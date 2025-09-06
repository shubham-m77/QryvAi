import React from 'react'
import { Button } from './ui/button'
import { ArrowRightIcon } from 'lucide-react'
import grainImg from "@/assets/grain.jpg";
import Link from 'next/link';


export const GetInTouch = () => {
    return (
        <section className="w-full flex items-center justify-center">
            <div className='w-full relative gradient  py-12 md:py-20 bg-[radial-gradient(circle,_rgba(223,235,235,1)_4%,_rgba(228,229,237,1)_62%,_rgba(204,210,217,1)_100%)]'>
                <div className="absolute inset-0 opacity-5 -z-10" style={{ backgroundImage: `url(${grainImg.src})` }} ></div>
                <div className="container mx-auto px-4 md:px-6  flex flex-col items-center justify-center">
                    <div className="text-center max-w-3xl mx-auto mb-8 space-y-1">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center text-gray-900">Are U Ready For Your Career Transformation?
                        </h2>
                        <p className='text-gray-700'>
                            Join the community of professionals building better careers with AI guidance.</p>
                    </div>
                    <Link href={'/dashboard'} >
                        <Button className='px-6 animate-bounce group py-2 gap-1 bg-background flex items-center text-white hover:bg-gray-800 transition-all cursor-pointer duration-300'>
                            <span>Start Your Journey </span> <span><ArrowRightIcon className="inline-block ml-2 h-4 w-4 group-hover:translate-x-0.5 transition duration-300" /></span>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
