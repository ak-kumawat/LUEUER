"use client";

import { SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthWrapper({ children }) {
  return (
    <>
      {/* ---------- NOT LOGGED IN ---------- */}
      <SignedOut>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a]">
          <h1 className="mb-6 text-4xl font-bold text-white">Welcome to LUEUER</h1>
          <SignIn />
          <div className="mt-4">
            <span className="text-sm text-gray-400">Don’t have an account? </span>
            <SignUp mode="modal" />
          </div>
        </div>
      </SignedOut>

      {/* ---------- LOGGED IN ---------- */}
      <SignedIn>
        <header className="flex items-center justify-between bg-gray-900 p-4 shadow-md">
          <h1 className="text-2xl font-semibold text-white">LUEUER</h1>
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="p-4 bg-gray-950 min-h-[calc(100vh-4rem)] text-white">
          {children}
        </main>
      </SignedIn>
    </>
  );
}
