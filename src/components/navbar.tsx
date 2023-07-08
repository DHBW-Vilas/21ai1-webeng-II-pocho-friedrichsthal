"use client";

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
import { useRouter } from "next/router";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { LoadingPage } from "./loading";
import dayjs from "dayjs";

function SignedInNavbar() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const userQuery = api.user.getSelf.useQuery();
  const notificationQuery = api.notifcation.getNotifications.useQuery();

  if (notificationQuery.isError && isSignedIn) {
    toast.error("Error while fetching notifications");
    throw new Error("Error while fetching notifications");
  }

  if (userQuery.isError && isSignedIn) {
    toast.error("Error while fetching user data");
    throw new Error("Error while fetching user data");
  }

  if ((!userQuery.data || !notificationQuery.data) && isSignedIn)
    return <LoadingPage />;

  const userRole = userQuery.data?.role;
  const userNotifications = notificationQuery.data;

  const unReadNotifications = userNotifications?.filter(
    (notification) => !notification.read
  );

  const currentPage = router.pathname.split("/")[1];

  return (
    <nav className="h-18 sticky top-0 grid w-full grid-flow-col grid-cols-3 items-center justify-stretch bg-primary px-4">
      <Link
        className="flex  gap-4 justify-self-start text-2xl font-bold text-white"
        href="/"
      >
        <Image
          className="h-14 w-auto"
          src="/PoCho_Logo-small.png"
          width={50}
          height={50}
          alt="Logo"
        />
        <span className="text-slate-600">
          Posaunenchor <br /> Friedrichsthal
        </span>
      </Link>
      <div className="flex justify-evenly">
        <Link
          className={
            "text-" + (currentPage == "" ? "accent font-bold" : "slate-100")
          }
          href="/"
        >
          Home
        </Link>
        <Link
          className={
            "text-" +
            (currentPage == "events" ? "accent font-bold" : "slate-100")
          }
          href="/events"
        >
          Events
        </Link>
        <Link
          className={
            "text-" + (currentPage == "news" ? "accent font-bold" : "slate-100")
          }
          href="/news"
        >
          News
        </Link>
        {isSignedIn && userRole != "GUEST" && (
          <>
            <Link
              className={
                "text-" +
                (currentPage == "games" ? "accent font-bold" : "slate-100")
              }
              href="/games"
            >
              Games
            </Link>
            <Link
              className={
                "text-" +
                (currentPage == "dashboard" ? "accent font-bold" : "slate-100")
              }
              href="/dashboard"
            >
              Dashboard
            </Link>
          </>
        )}
      </div>
      <div className="float-right flex min-h-fit items-center justify-end align-middle">
        {!isSignedIn && (
          <span className="mr-4 text-white">
            <SignInButton redirectUrl="/userSync" />
          </span>
        )}
        {!!isSignedIn && (
          <div className="flex w-28 flex-row justify-between align-middle">
            <div>
              <Popover>
                <PopoverTrigger className="relative h-full align-middle">
                  <div
                    className={
                      "absolute right-[-5px] top-2 z-50 " +
                      (unReadNotifications!.length > 0 ? "" : "hidden")
                    }
                  >
                    <span className={"relative flex h-3 w-3"}>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-accent"></span>
                    </span>
                  </div>
                  <div className="rounded-md border-2 border-slate-100 bg-slate-200 p-1 opacity-60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                      />
                    </svg>
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="flex flex-col gap-2 p-2">
                    {userNotifications!.length == 0 && (
                      <span className="text-center text-slate-600">
                        No Notifications
                      </span>
                    )}
                    {userNotifications!.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex flex-row justify-between"
                      >
                        <h3 className="text-slate-600">{notification.title}</h3>
                        <span className="text-slate-600">
                          {notification.content}
                        </span>
                        <span className="text-slate-600">
                          {dayjs(notification.createdAt).format(
                            "DD.MM.YYYY HH:mm"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Image
                    className=" mt-2 h-auto w-auto rounded-full border-2 border-slate-600"
                    src={user.profileImageUrl}
                    alt="Profile Image"
                    width={40}
                    height={40}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={"/user"} replace>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="w-full" asChild>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function SignedOutNavbar() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const currentPage = router.pathname.split("/")[1];

  return (
    <nav className="h-18 sticky top-0 grid w-full grid-flow-col grid-cols-3 items-center justify-stretch bg-primary px-4">
      <Link
        className="flex  gap-4 justify-self-start text-2xl font-bold text-white"
        href="/"
      >
        <Image
          className="h-14 w-auto"
          src="/PoCho_Logo-small.png"
          width={50}
          height={50}
          alt="Logo"
        />
        <span className="text-slate-600">
          Posaunenchor <br /> Friedrichsthal
        </span>
      </Link>
      <div className="flex justify-evenly">
        <Link
          className={
            "text-" + (currentPage == "" ? "accent font-bold" : "slate-100")
          }
          href="/"
        >
          Home
        </Link>
        <Link
          className={
            "text-" +
            (currentPage == "events" ? "accent font-bold" : "slate-100")
          }
          href="/events"
        >
          Events
        </Link>
        <Link
          className={
            "text-" + (currentPage == "news" ? "accent font-bold" : "slate-100")
          }
          href="/news"
        >
          News
        </Link>
      </div>
      <div className="float-right flex min-h-fit items-center justify-end align-middle">
        {!isSignedIn && (
          <span className="mr-4 text-white">
            <SignInButton redirectUrl={router.pathname} />
          </span>
        )}
      </div>
    </nav>
  );
}

export default function Navbar() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <SignedInNavbar />;
  }
  return <SignedOutNavbar />;
}
