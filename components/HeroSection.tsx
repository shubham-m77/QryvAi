"use client";
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import Image from 'next/image'

const HeroSection = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bannerElement = bannerRef.current;
    const scrollThreshold = 200; // px

    const handleScroll = () => {
      const scrollPosition = window.scrollY; // now updated each scroll
      if (bannerElement) {
        if (scrollPosition > scrollThreshold) {
          bannerElement.classList.add('scrolled');
        } else {
          bannerElement.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className='w-full pt-12 md:pt-16 pb-10 flex items-center flex-col justify-center'>
      <div className='space-y-6'>
        <div className='space-y-7 flex items-center justify-center flex-col text-center'>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-novatica font-bold text-center bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent animate-gradient">
            Your AI Companion for <br /> Career Growth
          </h1>

          <svg className="absolute top-40 md:top-70 left-50% w-[200px] md:w-[300px] h-[60px] lg:w-[400px]"

            viewBox="0 0 500 100"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="landingStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                <stop offset="20%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#f472b6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path
              d="M 0 60 Q 125 40 250 60 Q 375 80 500 60"
              fill="none"
              stroke="url(#landingStroke)"   // ✅ fixed here
              strokeWidth="6"
              strokeLinecap="round"
            />

          </svg>
          <p className='md:text-xl max-w-[600px] text-muted-foreground'>
            Your AI career partner for resume building, job discovery, and interview success — built for real-world results.
          </p>
        </div>
        <div className='space-x-4 flex items-center justify-center mt-8'>
          <Button asChild size="lg" className="px-8">
            <Link href="/dashboard">Get Started</Link>
          </Button>

          <Button asChild size="lg" className="px-8 " variant="outline">
            <Link href="/documentation" className=''>Documentation</Link>
          </Button>
        </div>
      </div>
      <div className='hero-image-wrapper mt-8 px-4 md:px-8'>
        <div ref={bannerRef} className='hero-image w-full md:max-w-full mx-auto md:h-[550px] overflow-hidden rounded-xl object-cover outline-2 outlineshadow-2xl transition-all duration-500 ease-in-out'>
          <Image src="/landing-page-banner.png" alt="QRYV_AI" width={1280} height={720} priority className='object-contain shadow-2xl border mx-auto rounded-xl ' />
        </div>
      </div>
    </section>
  )
}

export default HeroSection;
