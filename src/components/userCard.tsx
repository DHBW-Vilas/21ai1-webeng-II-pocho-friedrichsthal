import { type User } from "@prisma/client";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "react-hot-toast";
import { EditButton } from "./buttons";
import { Card } from "./ui/card";
import Image from "next/image";
import { Tag } from "./tag";

export const UserCardDetails = (userState: User) => {
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
    <div className="flex flex-col align-middle">
      <span className="text-lg ">
        {userState.firstName &&
        userState.lastName &&
        userState.firstName != "" &&
        userState.lastName != ""
          ? userState.firstName.toString() + " " + userState.lastName.toString()
          : ""}
      </span>

      <div>
        <span className=" font-thin text-slate-400">
          {"@" + userState.displayName}
        </span>{" "}
        {<Tag message={role} type="role" role={userState.role} />}
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
  );
};

export const UserCard = (user: User, { ...props }) => {
  const updateUserMutation = api.user.updateUser.useMutation();
  const router = useRouter();

  const [userState, setUser] = useState(user);

  if (updateUserMutation.isError) {
    toast.error("Error updating user " + updateUserMutation.error.message);
  }
  if (updateUserMutation.isSuccess) {
    toast.success("User updated successfully");
    setUser(updateUserMutation.data);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/user");
  }

  const isAdmin = props.isAdmin as boolean;

  return (
    <Card className="relative flex h-36 w-96 justify-around gap-6 p-2 align-middle">
      <EditButton
        className={!isAdmin ? "none" : ""}
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          router.push(`/user/update/${userState.clerkId}`);
        }}
      />
      <Image
        src={userState.imageUrl ? userState.imageUrl : "/default-profile.png"}
        alt="Profile Picture"
        className="m-auto h-20 w-20 justify-center rounded-full"
        width={52}
        height={52}
      />
      <div className="w-60">
        <UserCardDetails {...userState} />
      </div>
    </Card>
  );
};
