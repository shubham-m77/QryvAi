import React from "react"

export default function MainLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="container mx-auto mb-20 px-8 md:px-16 lg:px-24 my-24 sm:my-28 ">
			{children}
		</div>
	)
}
