import React from 'react'
import { faqs } from '@/data/faqs.js'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
const Faqs = () => {
    return (
        <section className="w-full bg-background py-12 md:py-24 lg:py-32">
            <div className="container mx-auto px-4 md:px-6  flex flex-col items-center justify-center">
                <div className="mb-12 gap-1">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center ">Frequently Asked Questions</h2>
                    <p className='text-gray-400 text-center'>Resolutions of common questions about our platfform</p>
                </div>
                <div className='max-w-6xl mx-auto'>
                    {
                        faqs?.map((item, idx) => (
                            <Accordion type="single" key={idx} collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>{item.question}</AccordionTrigger>
                                    <AccordionContent className='text-gray-400'>
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

export default Faqs