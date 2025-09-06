import React from "react"

export default function MainLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="container mx-auto mb-20">
			{children}
		</div>
	)
}
