import { db } from "./prisma"
import { auth } from "./auth"

export const checkUser = async () => {
  const session = await auth()
  if (!session?.user) return null

  try {
    // Try to find user in DB by email
    const loggedInUser = await db.user.findUnique({
      where: { email: session.user.email! },
      include: { accounts: true, sessions: true }, // helpful if you want linked data
    })

    if (loggedInUser) return loggedInUser

    // If not found → create new user
    const newUser = await db.user.create({
      data: {
        email: session.user.email!,
        name: session.user.name || null,
        image: session.user.image || null,
      },
    })

    return newUser
  } catch (err: any) {
    console.error("Error in checkUser:", err.message)
    return null
  }
}
