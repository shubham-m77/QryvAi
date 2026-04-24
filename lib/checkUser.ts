import { db } from "./prisma"
import { auth } from "./auth"

export const checkUser = async () => {
  const session = await auth()
  if (!session?.user) return null

  try {
    const email = session.user.email
    if (!email) return null

    const loggedInUser = await db.user.findUnique({
      where: { email },
      include: { accounts: true, sessions: true },
    })

    if (loggedInUser) return loggedInUser

    const newUser = await db.user.create({
      data: {
        email,
        name: session.user.name || null,
        image: session.user.image || null,
      },
    })

    return newUser
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error("Unknown error in checkUser")
    console.error("Error in checkUser:", errorObj.message)
    return null
  }
}
