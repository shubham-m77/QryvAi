"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { signinSchema } from "@/lib/validations"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"

type FormValues = z.infer<typeof signinSchema>
export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    })
    setLoading(false)

    if (!res?.error) router.push("/dashboard")
    else form.setError("password", { message: "Invalid email or password!" })
  }

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl gap-x-1.5 font-bold flex items-center justify-center ">Welcome back to <Link
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} className={`${form.formState.errors.email ? "outline-red-600" : ''}`} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label> <Link href={'#'} className='text-gray-400 text-xs'>Forgot Your Password?</Link></div>

              <Input id="password" type="password" {...form.register("password")} className={`${form.formState.errors.password ? "outline-red-600" : ''}`} />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
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

          <p className="text-center text-sm text-muted-foreground">
            New here? <Link href="/sign-up" className="text-blue-600 hover:underline">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>

  )
}
