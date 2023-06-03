import Navbar from "~/components/navbar";
import { api } from "~/utils/api";
import Head from "next/head";
import { type User } from "@prisma/client";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Card } from "~/components/ui/card";
import Image from "next/image";
import { Tag } from "~/components/tag";
import { EditButton } from "@/src/components/buttons";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

const UserCard = (user: User) => {
  const updateUserMutation = api.user.updateUser.useMutation();
  const router = useRouter();

  const [userState, setUser] = useState(user);

  const groupsQuery = api.user.getGroupsOfUser.useQuery({
    userId: userState.clerkId,
  });

  if (groupsQuery.isError) {
    throw groupsQuery.error;
  }
  if (!groupsQuery.isSuccess) {
    return <Skeleton className="h-36 w-96" />;
  }

  if (!groupsQuery.data) {
    return <div>No groups found</div>;
  }

  if (updateUserMutation.isError) {
    toast.error("Error updating user " + updateUserMutation.error.message);
  }
  if (updateUserMutation.isSuccess) {
    toast.success("User updated successfully");
    setUser(updateUserMutation.data);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/user");
  }

  const groups = groupsQuery.data;

  let role = userState.role.toString().toLocaleLowerCase();
  const primaryInstrument = userState.primaryInstrument
    .toString()
    .toLocaleLowerCase();

  role = role.replace(/(\w)(\w*)/g, function (g0, g1: string, g2: string) {
    return g1.toUpperCase() + g2.toLowerCase();
  });

  const instrument = primaryInstrument.replace(
    /(\w)(\w*)/g,
    function (g0, g1: string, g2: string) {
      return g1.toUpperCase() + g2.toLowerCase();
    }
  );

  const secondaryInstrument = userState.secondaryInstrument
    ?.toString()
    .toLocaleLowerCase();

  secondaryInstrument
    ? secondaryInstrument.replace(
        /(\w)(\w*)/g,
        function (g0, g1: string, g2: string) {
          return g1.toUpperCase() + g2.toLowerCase();
        }
      )
    : null;

  let startedAt = null;
  if (userState.startedAt) {
    startedAt = new Date(userState.startedAt);
  }

  return (
    <div className="relative">
      <EditButton
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          router.push(`/user/update/${userState.clerkId}`);
        }}
      />

      <Card className="relative flex h-36 w-96 justify-around gap-6 p-2 align-middle">
        <Image
          src={userState.imageUrl ? userState.imageUrl : "/default-profile.png"}
          alt="Profile Picture"
          className="m-auto h-20 w-20 justify-center rounded-full"
          width={52}
          height={52}
        />
        <div className="flex w-60 flex-col align-middle">
          <span className="text-lg ">
            {userState.firstName &&
            userState.lastName &&
            userState.firstName != "" &&
            userState.lastName != ""
              ? userState.firstName.toString() +
                " " +
                userState.lastName.toString()
              : ""}
          </span>

          <div>
            <span className=" font-thin text-slate-400">
              {"@" + userState.displayName}
            </span>{" "}
            {role === "Guest" ? (
              <span className="rounded-md bg-slate-500 px-2 py-1 text-slate-100">
                {role}
              </span>
            ) : role === "Member" ? (
              <span className="rounded-md bg-slate-700  px-2 py-1 text-slate-100">
                {role}
              </span>
            ) : (
              <span className="rounded-md bg-slate-900 px-2 py-1 text-slate-100">
                {role}
              </span>
            )}
          </div>
          <div className=" py-2">
            <span className="font-thin text-slate-400">{instrument}</span>
            {startedAt ? (
              <span className="font-thin text-slate-400">
                {" since "}
                {startedAt.toLocaleString("default", {
                  month: "long",
                })}{" "}
                {startedAt.getUTCFullYear()}
              </span>
            ) : (
              <span></span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 py-2">
            {groups.length > 0 ? (
              groups.map((group) => {
                return (
                  <span
                    className="flex-nowrap"
                    key={userState.clerkId.toString() + group.id.toString()}
                  >
                    <Tag message={group.name} />
                  </span>
                );
              })
            ) : (
              <span></span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
  const usersQuery = api.user.getAll.useQuery();

  if (usersQuery.isError) {
    throw usersQuery.error;
  }
  if (!usersQuery.isSuccess) {
    return <div>Loading...</div>;
  }

  if (!usersQuery.data) {
    return <div>No users found</div>;
  }

  const users = usersQuery.data as User[];

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex w-full">
        <div className="flex flex-col justify-center">
          <h1 className="text-center text-4xl">Admin Dashboard</h1>
          <div className="flex justify-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-center text-2xl">Users</h2>
              <div className="grid grid-flow-row grid-cols-2 justify-between gap-5">
                {users.map((user) => (
                  <UserCard key={user.clerkId} {...user} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const UserPage = () => {
  //get current user
  const userQuery = api.user.getSelf.useQuery();
  const router = useRouter();
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    //if not redirect to home page
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    return (
      <div>
        <h1>Not signed in</h1>
        <SignInButton />
      </div>
    );
  }

  if (userQuery.isSuccess) {
    if (!userQuery.data) {
      //if not redirect to register page
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push("/register");
    }
  }

  const user = userQuery.data;
  if (!user) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
    return <div>Redirecting...</div>;
  }

  return (
    <>
      <Head>
        <title>{user.displayName + "'s page"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <div className="w-full bg-red-100">
          <Navbar />
          <div className="flex justify-center">
            <div className="flex flex-col justify-center">
              <h1 className="text-center text-4xl">{user.displayName}</h1>
              <h2 className="text-center text-2xl">{user.email}</h2>
              {user.role == "ADMIN" && <AdminDashboard />}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
export default UserPage;
