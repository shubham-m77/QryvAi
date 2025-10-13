
import { handlers } from "@/lib/auth"

// Ensure this API route runs on the Node.js runtime (required for Prisma)
export const runtime = 'nodejs'

export const { GET, POST } = handlers
