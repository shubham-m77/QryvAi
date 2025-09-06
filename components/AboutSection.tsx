import React from 'react'
import grainImg from "@/assets/grain.jpg";

export const AboutSection = () => {
    return (
        <section className="w-full bg-muted/50 py-12 rounded-2xl backdrop-blur-sm">
            <div className="absolute inset-0 opacity-5 -z-10" style={{ backgroundImage: `url(${grainImg.src})` }} ></div>
            <div className="container mx-auto px-4 md:px-6  flex flex-col items-center justify-center">
                <div className="flex flex-wrap gap-8 p-6 w-full justify-evenly items-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <h3 className="text-4xl font-bold tracking-tight">
                            50+
                        </h3>
                        <p className="text-muted-foreground">
                            Industries Covered
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <h3 className="text-4xl font-bold tracking-tight">
                            1000+
                        </h3>
                        <p className="text-muted-foreground">
                            Interviews Questions
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <h3 className="text-4xl font-bold tracking-tight">
                            99%
                        </h3>
                        <p className="text-muted-foreground">
                            Success Rate
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <h3 className="text-4xl font-bold tracking-tight">
                            24/7
                        </h3>
                        <p className="text-muted-foreground">
                            AI Support
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
