import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Vercel-də işləmək üçün vacibdir
  trustHost: true,
  // Əsas sirri burada təyin edirik
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // Vercel-də yaranan PKCE xətalarını aradan qaldırır
      checks: ["none"],
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  // Vercel serverless funksiyaları üçün cookie ayarları
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    pkceCodeVerifier: {
      name: `__Secure-next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
        maxAge: 60 * 15,
      },
    },
    state: {
      name: `__Secure-next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
        maxAge: 60 * 15,
      },
    },
  },
  pages: { signIn: "/giris" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
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