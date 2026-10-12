import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/giris" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Google istifadəçisini DB-də yarat və ya tap
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name || "İstifadəçi",
            image: user.image || null,
          },
          create: {
            email: user.email,
            name: user.name || "İstifadəçi",
            image: user.image || null,
            emailVerified: true,
          },
        });
        return true;
      } catch (e) {
        console.error("signIn error:", e);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) token.uid = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.uid;
      return session;
    },
  },
});