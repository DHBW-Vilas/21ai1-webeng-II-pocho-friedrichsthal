// src\components\navbar.tsx
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { user, isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 flex w-full items-center  justify-between bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <Link className="text-2xl font-bold text-white" href="/">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} />
      </Link>
      <div className="flex items-center">
        {!isSignedIn && (
          <span className="mr-4 text-white">
            <SignInButton redirectUrl="/events" />
          </span>
        )}
        {!!isSignedIn && (
          <div className="flex items-center">
            <img
              className="mr-4 h-10 w-10 rounded-full"
              src={user.profileImageUrl}
              alt={user.fullName?.toString()}
            />
            <span className="mr-4 text-white">
              <SignOutButton />
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
