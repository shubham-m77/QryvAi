import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import Header from "@/components/Header";
import SessionProviderWrapper from "@/components/SessionProviderWrapper"

const inter = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const novatica = localFont({
  src: [
    {
      path: "../public/fonts/NovaticaLight.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Novatica.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Novatica-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Novatica-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-novatica", // optional (for Tailwind/custom CSS)
  display: "swap", // prevents layout shift
});


export const metadata: Metadata = {
  title: "Qryv AI | Your AI Companion",
  description: "Qryv AI is your personal AI companion/career coach, designed to assist you with a wide range of tasks and provide intelligent solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>

      <body className={`${inter.variable}  ${novatica.variable} antialiased min-h-screen flex flex-col items-center justify-center`}>
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class" defaultTheme="dark" enableSystem
          >
            <Header />
            <main className="w-full top-0 min-h-screen">{children}</main>
            <footer className="bg-muted text-center py-8 text-gray-100 w-full font-bold text-base">Made with ❤️ by <a href="https://shubham-developer.vercel.app/" className="outline-none text-inherit cursor-pointer hover:scale-1.1 transition-all duration-250 ease-in-out">Shubham M</a></footer>
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
