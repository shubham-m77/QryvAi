
import { NextResponse } from "next/server"
import { db } from "@/lib/prisma"
import { signupSchema } from "@/lib/validations"
import { hashPassword } from "@/lib/helpers/password"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid data"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { name, email, password } = parsed.data;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "User already exists!" }, { status: 401 })
    }

    const hashed = await hashPassword(password)
    const user = await db.user.create({
      data: { name, email, password: hashed },
    })

    return NextResponse.json({ message: "Sign-up Successfull" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 })
  }
}
