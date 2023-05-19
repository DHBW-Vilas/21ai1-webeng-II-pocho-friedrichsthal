// src\components\navbar.tsx
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Navbar() {
  const { user, isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 flex h-20 w-full items-center justify-between bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <Link className="text-2xl font-bold text-white" href="/">
        <Image
          className="h-14 w-14"
          src="/favicon.ico"
          width={50}
          height={50}
          alt="Logo"
        />
      </Link>
      <div className="flex">
        <Link className="text-slate-100" href="/">
          Home
        </Link>
        {isSignedIn && (
          <Link className="ml-4 text-slate-100" href="/events">
            Events
          </Link>
        )}
      </div>
      <div className="flex items-center">
        {!isSignedIn && (
          <span className="mr-4 text-white">
            <SignInButton redirectUrl="/userSync" />
          </span>
        )}
        {!!isSignedIn && (
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Image
                  className="h-10 w-10 rounded-full"
                  src={user.profileImageUrl}
                  alt="Profile Image"
                  width={40}
                  height={40}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
}
