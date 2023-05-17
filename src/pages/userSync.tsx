import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { type NextPage } from "next";
import { LoadingPage } from "~/components/loading";

const UserSync: NextPage = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  if (isSignedIn) {
    // check if user with id user.id exists in your database
    const userQuery = api.user.getSelf.useQuery();

    if (userQuery.isSuccess) {
      if (!userQuery.data) {
        //if not redirect to register page
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        router.push("/register");
      } else {
        // if yes, redirect to user page
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        router.push("/user/");
      }
    } else {
      return (
        <div className="bg-slate-900">
          <LoadingPage />
        </div>
      );
    }
  }

  return <div></div>;
};

export default UserSync;
