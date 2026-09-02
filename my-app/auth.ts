import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import authConfig from "./auth.config";
import { getUserById } from "./modules/auth/actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),

  secret: process.env.AUTH_SECRET,

  ...authConfig,

  session: {
    strategy: "database",
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;

        const existingUser = await getUserById(user.id);
        if (existingUser) {
          session.user.role = existingUser.role;
        }
      }

      return session;
    },
  },
});
