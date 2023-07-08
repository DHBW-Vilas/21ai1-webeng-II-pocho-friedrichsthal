import { LoadingPage } from "@/src/components/loading";
import Navbar from "@/src/components/navbar";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Separator } from "@/src/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/src/components/ui/tooltip";
import { api } from "@/src/utils/api";

import { useUser } from "@clerk/nextjs";
import { type User, Instrument, UserRole } from "@prisma/client";
import dayjs from "dayjs";
import Head from "next/head";
import Link from "next/link";
import router, { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

const UpdateUserForm = ({ ...props }) => {
  const user = props.user as User;
  const updateUserMutation = api.user.updateUser.useMutation();
  const addUserToGroupMutation = api.group.addUserToGroup.useMutation();
  const removeUserFromGroupMutation =
    api.group.removeUserFromGroup.useMutation();
  const personalGroupsQuery = api.user.getGroupsOfUser.useQuery({
    userId: user.clerkId,
  });
  const allGroupsQuery = api.group.getAllGroups.useQuery();

  const [userState, setUser] = useState(user);

  if (!props.variant) {
    toast.error("Error loading UpdateUserForm: variant is undefined");
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }
  if (updateUserMutation.isSuccess) {
    console.log("Successfully updated user");
    toast.success("Successfully updated user");
    updateUserMutation.reset();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push(`/user`);
  }

  if (updateUserMutation.isError) {
    toast.error("Error updating user: " + updateUserMutation.error.message);
    console.log(updateUserMutation.error.message);
    <div></div>;
  }

  if (personalGroupsQuery.isError) {
    toast.error(
      "Error fetching groups of user " + personalGroupsQuery.error.message
    );
    console.log(
      personalGroupsQuery.error.message + "personalGroupsQuery.error"
    );
  }
  if (allGroupsQuery.isError) {
    toast.error("Error fetching groups " + allGroupsQuery.error.message);
    console.log(allGroupsQuery.error.message + "allGroupsQuery.error");
  }

  if (allGroupsQuery.isLoading || personalGroupsQuery.isLoading) {
    return <LoadingPage />;
  }

  if (!allGroupsQuery.isSuccess || !personalGroupsQuery.isSuccess) {
    toast.error("Error fetching groups");
    console.log("Error fetching groups");
    return <div>Error fetching groups</div>;
  }

  if (
    addUserToGroupMutation.isSuccess ||
    removeUserFromGroupMutation.isSuccess
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    personalGroupsQuery.refetch();
    addUserToGroupMutation.reset();
    removeUserFromGroupMutation.reset();
  }

  const allGroups = allGroupsQuery.data;
  const personalGroups = personalGroupsQuery.data;

  return (
    <div className="p-4">
      <form className="grid grid-cols-2 gap-4">
        <div className=" col-span-2">
          <Label htmlFor="displayname">Display Name</Label>
          <Input
            id="displayname"
            type="text"
            defaultValue={userState.displayName ? userState.displayName : ""}
            placeholder="Display Name"
            onChange={(e) => {
              setUser({ ...userState, displayName: e.target.value });
            }}
          />
        </div>
        <div>
          <Label htmlFor="lastname">Last Name</Label>
          <Input
            id="lastname"
            type="text"
            defaultValue={userState.lastName ? userState.lastName : ""}
            placeholder="Last Name"
            onChange={(e) => {
              setUser({ ...userState, lastName: e.target.value });
            }}
          />
        </div>
        <div>
          <Label htmlFor="firstname">First Name</Label>
          <Input
            id="firstname"
            type="text"
            defaultValue={userState.firstName ? userState.firstName : ""}
            placeholder="First Name"
            onChange={(e) => {
              setUser({ ...userState, firstName: e.target.value });
            }}
          />
        </div>
        <div className="col-span-2">
          <div className="relative">
            <Label htmlFor="email">Email</Label>
            <div id="info-button">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="absolute right-0 top-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6 text-slate-600 dark:text-slate-300"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </TooltipTrigger>
                  <TooltipContent>
                    {
                      "You can't change your email address. If you need to change it, please contact an developer."
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Input
            disabled
            id="email"
            type="email"
            defaultValue={userState.email ? userState.email : ""}
            placeholder="Email"
            onChange={(e) => {
              setUser({ ...userState, email: e.target.value });
            }}
          />
        </div>
        <div>
          <Label htmlFor="primaryInstrument">Primary Instrument</Label>
          <Select
            onValueChange={(value) => {
              setUser({ ...userState, primaryInstrument: value as Instrument });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={userState.primaryInstrument.replace(
                  /(\w)(\w*)/g,
                  function (g0, g1: string, g2: string) {
                    return g1.toUpperCase() + g2.toLowerCase();
                  }
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(Instrument).map((instrument) => {
                return (
                  <SelectItem
                    key={"firstInstr_" + instrument}
                    value={instrument}
                    disabled={
                      userState.secondaryInstrument
                        ? userState.secondaryInstrument === instrument &&
                          instrument !== "NONE"
                        : false
                    }
                  >
                    {instrument.replace(
                      /(\w)(\w*)/g,
                      function (g0, g1: string, g2: string) {
                        return g1.toUpperCase() + g2.toLowerCase();
                      }
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="secondaryInstrument">Secondary Instrument</Label>
          <Select
            onValueChange={(value) => {
              setUser({
                ...userState,
                secondaryInstrument: value as Instrument,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  userState.secondaryInstrument
                    ? userState.secondaryInstrument.replace(
                        /(\w)(\w*)/g,
                        function (g0, g1: string, g2: string) {
                          return g1.toUpperCase() + g2.toLowerCase();
                        }
                      )
                    : "None"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(Instrument).map((instrument) => {
                return (
                  <SelectItem
                    key={"secondInstr_" + instrument}
                    value={instrument}
                    disabled={
                      userState.secondaryInstrument
                        ? userState.primaryInstrument === instrument &&
                          instrument !== "NONE"
                        : false
                    }
                  >
                    {instrument.replace(
                      /(\w)(\w*)/g,
                      function (g0, g1: string, g2: string) {
                        return g1.toUpperCase() + g2.toLowerCase();
                      }
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="startedAt">Startet At</Label>
          <Input
            id="startedAt"
            type="date"
            defaultValue={
              userState.startedAt
                ? dayjs(userState.startedAt).set("day", 2).format("YYYY-MM-DD")
                : ""
            }
            onChange={(e) => {
              setUser({
                ...userState,
                startedAt: dayjs(e.target.value).toDate(),
              });
            }}
          />
        </div>
        <div>
          <div className="relative">
            <Label htmlFor="role">Role</Label>
            {props.variant !== "admin" || userState.role === "ADMIN" ? (
              <div id="info-button">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="absolute right-0 top-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6 text-slate-600 dark:text-slate-300"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      {props.variant === "self-admin"
                        ? "You cannot change your own role."
                        : "You cannot change the role of an admin."}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <span></span>
            )}
          </div>

          <Select
            onValueChange={(value) => {
              setUser({
                ...userState,
                role: value as UserRole,
              });
            }}
            disabled={props.variant !== "admin" || userState.role === "ADMIN"}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={userState.role.replace(
                  /(\w)(\w*)/g,
                  function (g0, g1: string, g2: string) {
                    return g1.toUpperCase() + g2.toLowerCase();
                  }
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(UserRole).map((role) => {
                return (
                  <SelectItem
                    disabled={
                      props.variant !== "admin" ? role === "ADMIN" : false
                    }
                    key={"role_" + role}
                    value={role}
                  >
                    {role.replace(
                      /(\w)(\w*)/g,
                      function (g0, g1: string, g2: string) {
                        return g1.toUpperCase() + g2.toLowerCase();
                      }
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        {
          (props.variant =
            "admin" || "self-admin" ? (
              <div className="col-span-2">
                <Label htmlFor="groups">Groups</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button variant={"outline"} className="w-full ">
                      Select Groups
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {allGroups.map((group) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={"group_" + group.id}
                          checked={
                            personalGroups.find(
                              (personalGroup) => personalGroup.id === group.id
                            )
                              ? true
                              : false
                          }
                          onSelect={() => {
                            const isInGroup = personalGroups.find(
                              (personalGroup) => personalGroup.id === group.id
                            )
                              ? true
                              : false;

                            if (isInGroup) {
                              toast.error("Removed from " + group.name);
                              removeUserFromGroupMutation.mutate({
                                userId: userState.clerkId,
                                groupId: group.id,
                              });
                            } else {
                              toast.success("Added to " + group.name);
                              addUserToGroupMutation.mutate({
                                userId: userState.clerkId,
                                groupId: group.id,
                              });
                            }
                          }}
                        >
                          {group.name}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div></div>
            ))
        }

        <Separator className="col-span-2" />
        <Button
          className="col-span-2"
          onClick={() => {
            updateUserMutation.mutate({
              clerkId: userState.clerkId,
              displayName: userState.displayName
                ? userState.displayName
                : undefined,
              email: userState.email ? userState.email : undefined,
              firstName: userState.firstName ? userState.firstName : undefined,
              lastName: userState.lastName ? userState.lastName : undefined,
              primaryInstrument: userState.primaryInstrument,
              secondaryInstrument: userState.secondaryInstrument
                ? userState.secondaryInstrument
                : undefined,
              startedAt: userState.startedAt ? userState.startedAt : undefined,
              role: userState.role,
            });
          }}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

const UpdateUserInfo = () => {
  const router = useRouter();
  const { userId } = router.query;
  const getSelfQuery = api.user.getSelf.useQuery();

  if (!userId) {
    toast.error("No user ID provided.");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
  }

  if (typeof userId !== "string") {
    toast.error("Invalid user ID provided.");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
  }

  //get user from trpc
  const userQuery = api.user.getOne.useQuery({ userId: userId as string });

  const { isSignedIn, user: clerkUser } = useUser();

  if (getSelfQuery.error) {
    toast.error("Error fetching current user.");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  if (userQuery.error) {
    toast.error("Error fetching user.");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  if (!userQuery.data) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  if (userQuery.data) {
    if (!userQuery.data.clerkId) {
      toast.error("User not found.");
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push("/userSync");
      return (
        <div>
          <LoadingPage />
        </div>
      );
    }
  }

  if (!getSelfQuery.data) {
    toast.error("Error fetching current user.");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  const currentUser = getSelfQuery.data;
  const user = userQuery.data;

  if (!isSignedIn) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    router.push("/userSync");
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  if (currentUser.role !== "ADMIN") {
    if (user.clerkId !== clerkUser.id) {
      toast.error("You are not authorized to update this user. Redirecting...");
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push("/userSync");
      return (
        <>
          <Head>
            <title>Loading</title>
          </Head>
          <main>
            <div>
              <LoadingPage />
            </div>
          </main>
        </>
      );
    }
    return (
      <>
        <Head>
          <title>Update User</title>
        </Head>
        <main>
          <Navbar />
          <div>
            <UpdateUserForm user={user} variant={"self"} />
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>Update User</title>
      </Head>
      <main>
        <Navbar />
        <div className="mt-4 flex h-full justify-center">
          <div className="h-full w-1/3 min-w-fit">
            <div className="relative rounded-md border-2 border-slate-400 bg-slate-200 bg-opacity-20 dark:border-slate-500">
              <Link href="/dashboard" className="absolute left-4 top-2">
                <Button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="m-auto mr-2 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                  Back
                </Button>
              </Link>
              <h1 className="mt-2 text-center font-serif text-2xl font-bold uppercase">
                Update User
              </h1>
              {user.clerkId === clerkUser.id ? (
                <UpdateUserForm user={user} variant={"self-admin"} />
              ) : (
                <UpdateUserForm user={user} variant={"admin"} />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UpdateUserInfo;
