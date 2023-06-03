import { type AppType } from "next/app";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

const publicPages = [
  "/",
  "/events",
  "/events/[id]",
  "/news",
  "/news/[id]",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/404",
];

const MyApp: AppType = ({ Component, pageProps }) => {
  // Get the pathname
  const { pathname } = useRouter();

  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);

  // If the current route is listed as public, render it directly
  // Otherwise, use Clerk to require authentication
  return (
    <ClerkProvider {...pageProps}>
      {isPublicPage ? (
        <>
          <Toaster />
          <Component {...pageProps} />
        </>
      ) : (
        <>
          <SignedIn>
            <Toaster />
            <Component {...pageProps} />
          </SignedIn>
          <SignedOut>
            <Toaster />
            <RedirectToSignIn />
          </SignedOut>
        </>
      )}
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
