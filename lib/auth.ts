// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { db } from "./prisma"
import { signinSchema } from "./validations"
import { verifyPassword } from "./helpers/password"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const data = signinSchema.safeParse(credentials)
        if (!data.success) return null;
        const { email, password } = data?.data;

        if (!email || !password) return null

        const user = await db.user.findUnique({
          where: { email: email },
        })
        if (!user || !password || !user.password) return null

        const valid = await verifyPassword(password, user.password)
        if (!valid) return null

        return user
      },
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    // Link Google account to existing user if emails match
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email ?? profile?.email
        if (!email) return false

        const existing = await db.user.findUnique({ where: { email } })
        if (existing && existing.id !== user.id) {
          // Link Google account to existing user, then prevent duplicate user
          await db.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId!,
              },
            },
            create: {
              userId: existing.id,
              type: account.type!,
              provider: "google",
              providerAccountId: account.providerAccountId!,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
              expires_at: account.expires_at ?? undefined,
              token_type: account.token_type ?? undefined,
              scope: account.scope ?? undefined,
              session_state: account.session_state?.toString() ?? undefined,
            },
            update: {
              userId: existing.id,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
              expires_at: account.expires_at ?? undefined,
              token_type: account.token_type ?? undefined,
              scope: account.scope ?? undefined,
              session_state: account.session_state?.toString() ?? undefined,
            },
          })

          // delete the temp user Auth.js may have created
          if (user.id && user.id !== existing.id) {
            try {
              await db.user.delete({ where: { id: user.id } })
            } catch (err: any) {
              return err.message;
            }
          }
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },

  pages: {
    signIn: "/sign-in",
  },
})
