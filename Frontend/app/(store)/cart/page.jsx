"use client";

import { SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/nextjs";

export default function StorePage() {
  return (
    <>
      <SignedOut>
        <SignIn />
      </SignedOut>

      <SignedIn>
        <UserButton />
        {/* Your store UI goes here */}
      </SignedIn>
    </>
  );
}