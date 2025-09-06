"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import profilePic from "@/assets/profile-pic.jpg";
import { Button } from "./ui/button";
import {
  ChevronDown,
  FileIcon,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (session?.user && (pathname?.includes("sign-in") || pathname?.includes("sign-up"))) {
      router.push("/");
    }
  }, [session?.user, pathname, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ width: "90%", borderRadius: "9999px", marginTop: 20 }}
      animate={
        isScrolled
          ? { width: "100%", borderRadius: "0px", marginTop: 0 }
          : { width: "90%", borderRadius: "9999px", marginTop: 20 }
      }
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 z-[100]"
    >
      {/* Outer border */}
      <div className={`${isScrolled ? "border-b-1" : "glowing-border rounded-full border-1"}  border-gray-400/50  h-16`}>
        {/* Inner content */}
        <div className="inner flex items-center justify-between px-8 md:px-16 h-full bg-gray-800/20 backdrop-blur-md">
          {/* Logo */}
          <Link
            className="text-[#ECFDF5] text-2xl md:text-3xl font-bold font-novatica"
            href="/"
          >
            Qryv
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#A855F7] to-[#f472b6] bg-clip-text text-transparent animate-gradient">
              AI
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-x-4">
            {session?.user ? (
              <Link href="/dashboard">
                <Button className="hover:bg-gray-800 border hover:border-gray-500 text-gray-100 border-muted bg-inherit cursor-pointer">
                  <LayoutDashboard />
                  <span className="hidden md:block">Industry Insights</span>
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button className="hover:bg-inherit border hover:border-gray-500 text-gray-100 border-muted bg-inherit cursor-pointer">
                  Login
                </Button>
              </Link>
            )}

            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gray-200 text-gray-900 hover:bg-gray-300 cursor-pointer">
                  <StarsIcon className="size-4" />
                  <span className="hidden md:block">Growth Tools</span>
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/resume-maker" className="flex gap-1 items-center font-semibold">
                    <FileIcon className="size-4" />
                    <span>Build Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ai-cover-letter" className="flex gap-1 items-center font-semibold">
                    <PenBox className="size-4" />
                    <span>Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/interview-prep" className="flex gap-1 items-center font-semibold">
                    <GraduationCap className="size-4" />
                    <span>Interview Prep...</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile */}
            {session?.user ? (
              <Link href="/profile">
                <Image
                  src={session?.user?.image ? session.user.image : profilePic}
                  width={60}
                  height={60}
                  alt="Profile"
                  className="rounded-full size-8 object-cover"
                />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
