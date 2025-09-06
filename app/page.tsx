import HeroSection from "@/components/HeroSection"
import { FeaturesSection } from "../components/FeaturesSection"
import { AboutSection } from "@/components/AboutSection"
import HowItWorks from "@/components/HowItWorks"
import TestimonialSection from "@/components/TestimonialSection"
import Faqs from "@/components/FaqsSection"
import { GetInTouch } from "@/components/GetInTouch"

const Home = () => {
  return (
    <div className='mt-16'>
      <div className="grid-bg "> </div>
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <HowItWorks />
      <TestimonialSection />
      <Faqs />
      <GetInTouch />
    </div>
  )
}

export default Home
