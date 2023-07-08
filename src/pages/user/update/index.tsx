import { LoadingPage } from "@/src/components/loading";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

const UpdateUserRedirect = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  if (!isSignedIn || !user) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  router.push(`/user/update/${user.id}`);
  return (
    <div>
      <LoadingPage />
    </div>
  );
};

export default UpdateUserRedirect;
