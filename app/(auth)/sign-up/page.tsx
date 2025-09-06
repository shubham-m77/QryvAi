"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signupSchema } from "@/lib/validations"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link";

type FormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
    setLoading(false)

    if (res.ok) {
      // Optionally auto-login:
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl: "/dashboard",
      })
    } else {
      const data = await res?.json().catch(() => ({}))
      form.setError("email", { message: data.error ?? "Signup failed" })
    }
  }


  return (
    <div className="w-full flex items-center justify-center mt-14">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="">
          <CardTitle className="text-center text-2xl gap-x-1.5 font-bold flex items-center justify-center ">Welcome to <Link
            className=" font-bold font-novatica"
            href="/"
          >
            Qryv
            <span className="bg-gradient-to-r from-[#60a5fa] via-[#A855F7] to-[#f472b6] bg-clip-text text-transparent animate-gradient">
              AI
            </span>
          </Link></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                className={`${form.formState.errors.name ? "outline-red-600" : ''}`}
                placeholder="Enter your full name"
                required
                {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className={`${form.formState.errors.email ? "outline-red-600" : ''}`}
                required
                {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" >Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a password"
                required
                className={`${form.formState.errors.password ? "outline-red-600" : ''}`}
                {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <FcGoogle size={20} /> Sign in with Google
          </Button>

          <div className="mt-2 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => router.push("/sign-in")}
            >
              Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
