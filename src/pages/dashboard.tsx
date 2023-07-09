import { SignIn, useUser } from "@clerk/nextjs";
import { api } from "../utils/api";
import { toast } from "react-hot-toast";
import Navbar from "../components/navbar";
import Head from "next/head";
import { type User } from "@prisma/client";
import { LoadingPage } from "../components/loading";
import { useState } from "react";
import {
  GroupCard,
  GroupDetailsCard,
  PostCard,
  UserCard,
} from "../components/cards";
import { EventCard } from "../components/cards";
import Footer from "../components/footer";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../utils/api";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "../components/ui/dialog";
import { PlusIcon } from "lucide-react";
import CreateGroupForm from "../components/createGroupForm";

type RouterOutput = inferRouterOutputs<AppRouter>;

const Dashboard = () => {
  //check if user is signed in and check if role is member or admin
  const { isSignedIn } = useUser();
  const userQuery = api.user.getSelf.useQuery();

  if (!isSignedIn) {
    return (
      <div>
        <SignIn routing="path" path="/userSync" />
      </div>
    );
  }

  if (userQuery.isError) {
    toast.error("Error while fetching user data");
    throw userQuery.error;
  }

  if (userQuery.isLoading) {
    return <LoadingPage />;
  }

  const role = userQuery.data.role;

  if (role == "GUEST") {
    return (
      <main className="h-screen">
        <Navbar />
        <div>
          At the moment only members and admins can access the dashboard.
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="h-screen">
      <Navbar />
      <div className="mb-auto">
        {role === "ADMIN" ? <AdminDashboard /> : <MemberDashboard />}
      </div>
      <Footer />
    </main>
  );
};

const AdminDashboard = () => {
  const statsQuery = api.general.getStatistics.useQuery();
  const usersQuery = api.user.getAll.useQuery();
  const postsQuery = api.post.getAllPosts.useQuery({});
  const eventsQuery = api.event.getAllEvents.useQuery();
  const groupsQuery = api.group.getAllGroups.useQuery();

  //error handling
  if (
    statsQuery.isError ||
    usersQuery.isError ||
    postsQuery.isError ||
    eventsQuery.isError ||
    groupsQuery.isError
  ) {
    toast.error("Error while fetching data");
    throw new Error("Error while fetching data");
  }

  //loading
  if (
    statsQuery.isLoading ||
    usersQuery.isLoading ||
    postsQuery.isLoading ||
    eventsQuery.isLoading ||
    groupsQuery.isLoading
  ) {
    return <LoadingPage />;
  }

  //data
  if (
    !statsQuery.data ||
    !usersQuery.data ||
    !postsQuery.data ||
    !eventsQuery.data ||
    !groupsQuery.data
  ) {
    toast.error("Error while fetching data");
    throw new Error("Error while fetching data");
  }

  const stats = statsQuery.data;
  const users = usersQuery.data as User[];
  const posts = postsQuery.data;
  const events = eventsQuery.data;
  const groups = groupsQuery.data;

  return (
    <GenericDashboard {...{ stats, users, posts, events, groups }} isAdmin />
  );
};

const MemberDashboard = () => {
  const postsQuery = api.post.getAllFromSelf.useQuery();
  const eventsQuery = api.event.getAllFromSelf.useQuery();
  const groupsQuery = api.user.getGroupsOfUser.useQuery({});

  //error handling
  if (postsQuery.isError || eventsQuery.isError || groupsQuery.isError) {
    toast.error("Error while fetching data");
    throw new Error("Error while fetching data");
  }

  //loading
  if (postsQuery.isLoading || eventsQuery.isLoading || groupsQuery.isLoading) {
    return <LoadingPage />;
  }

  //data
  if (!postsQuery.data || !eventsQuery.data || !groupsQuery.data) {
    toast.error("Error while fetching data");
    throw new Error("Error while fetching data");
  }

  const stats = null;
  const posts = postsQuery.data;
  const users = [] as User[];
  const events = eventsQuery.data;
  const groups = groupsQuery.data;

  return (
    <GenericDashboard
      {...{ stats, users, posts, events, groups }}
      isAdmin={false}
    />
  );
};

type Statistics = RouterOutput["general"]["getStatistics"];
type DetailedNews = RouterOutput["post"]["getAllPosts"][number];
type DetailedEvent = RouterOutput["event"]["getAllEvents"][number];
type DetailedGroup = RouterOutput["group"]["getAllGroups"][number];

const GenericDashboard = (props: {
  stats: Statistics | null;
  users: User[];
  posts: DetailedNews[];
  events: DetailedEvent[];
  groups: DetailedGroup[];
  isAdmin: boolean;
}) => {
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedTab, setSelectedTab] = useState<
    "users" | "posts" | "events" | "groups"
  >("users");

  if (router.query.tab && router.query.tab !== selectedTab) {
    const tab = router.query.tab as "users" | "posts" | "events" | "groups";
    router.query.tab = undefined;
    setSelectedTab(tab);
  }
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const { stats, users, posts, events, groups, isAdmin } = props;

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/PoCho_Logo-small.png" />
      </Head>
      <main className=" mt-4 flex flex-col justify-center">
        {isAdmin && stats && (
          <div className="flex flex-row justify-center gap-4" id="stats">
            <div
              className="flex w-fit flex-col rounded-md border-2 border-slate-600 bg-slate-200 p-5 hover:cursor-pointer hover:bg-slate-500"
              onClick={() => setSelectedTab("users")}
            >
              <span className="text-center text-2xl font-extrabold text-accent">
                {stats.userCount}
              </span>
              <span className=" text-md text-center uppercase">Users</span>
            </div>
            <div
              className="flex w-fit flex-col rounded-md border-2 border-slate-600 bg-slate-200 p-5 hover:cursor-pointer hover:bg-slate-500"
              onClick={() => setSelectedTab("groups")}
            >
              <span className="text-center text-2xl font-extrabold text-accent">
                {stats.groupCount}
              </span>
              <span className=" text-md text-center uppercase">Groups</span>
            </div>
            <div
              className="flex w-fit flex-col rounded-md border-2 border-slate-600 bg-slate-200 p-5 hover:cursor-pointer hover:bg-slate-500"
              onClick={() => setSelectedTab("events")}
            >
              <span className="text-center text-2xl font-extrabold text-accent">
                {stats.eventCount}
              </span>
              <span className=" text-md text-center uppercase">Events</span>
            </div>

            <div
              className="flex w-fit flex-col rounded-md border-2 border-slate-600 bg-slate-200 p-5 hover:cursor-pointer hover:bg-slate-500"
              onClick={() => setSelectedTab("posts")}
            >
              <span className="text-center text-2xl font-extrabold text-accent">
                {stats.postCount}
              </span>
              <span className=" text-md text-center uppercase">News</span>
            </div>
          </div>
        )}
        {!isAdmin && (
          <div className="flex flex-row justify-center gap-4" id="stats">
            <div
              className="flex w-fit flex-col rounded-md border-2 border-slate-600 bg-slate-200 p-5 hover:cursor-pointer hover:bg-slate-500"
              onClick={() => setSelectedTab("groups")}
            >
              <span className="text-center text-2xl font-extrabold text-accent">
                {groups.length}
              </span>
              <span className=" text-md text-center uppercase">Groups</span>
            </div>
            <div
              className="flex w-fit flex-col rounded-md border-2 border-slate-600 bg-slate-200 p-5 hover:cursor-pointer hover:bg-slate-500"
              onClick={() => setSelectedTab("events")}
            >
              <span className="text-center text-2xl font-extrabold text-accent">
                {events.length}
              </span>
              <span className=" text-md text-center uppercase">Events</span>
            </div>

            <div
              className="flex w-fit flex-col rounded-md border-2 border-slate-600 bg-slate-200 p-5 hover:cursor-pointer hover:bg-slate-500"
              onClick={() => setSelectedTab("posts")}
            >
              <span className="text-center text-2xl font-extrabold text-accent">
                {posts.length}
              </span>
              <span className=" text-md text-center uppercase">News</span>
            </div>
          </div>
        )}

        {/* tabs */}
        {selectedTab === "users" ? (
          <div className="mt-4 flex justify-center">
            <div className="grid gap-5 sm:max-w-screen-sm sm:grid-cols-1 md:max-w-screen-md lg:max-w-screen-lg lg:grid-cols-2 ">
              {users.map((user) => {
                return (
                  <div key={user.clerkId} className="">
                    <UserCard user={user} isAdmin />
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedTab === "posts" ? (
          <div>
            <div className="mt-4 flex flex-col justify-center gap-5">
              <Button
                className=" m-auto -mb-2 w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg"
                asChild
              >
                <Link href="/news/create">Create News</Link>
              </Button>
              {posts.map((post: DetailedNews) => {
                return (
                  <div key={post.id} className="last-of-type:mb-20">
                    <PostCard post={post} includeMeta isAdmin />
                  </div>
                );
              })}
              B
            </div>
          </div>
        ) : selectedTab === "events" ? (
          <div className="mt-4 flex justify-center">
            <div className="grid gap-5 sm:max-w-screen-sm sm:grid-cols-1 md:max-w-screen-md lg:max-w-screen-lg lg:grid-cols-2 ">
              {events.map((event: DetailedEvent) => {
                return (
                  <div key={event.id} className="last-of-type:mb-20">
                    <EventCard event={event} isAdmin={isAdmin} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedTab === "groups" ? (
          <>
            {isAdmin && (
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  if (open) {
                    setDialogOpen(true);
                  } else {
                    setDialogOpen(false);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="m-auto -mb-2 mt-4 w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
                    <div className="flex flex-row gap-1">
                      <PlusIcon className="h-5 w-5" />
                      New Group
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-fit">
                  <DialogHeader>
                    <DialogTitle>Create Group</DialogTitle>
                    <DialogDescription>Create a new group.</DialogDescription>
                  </DialogHeader>
                  <CreateGroupForm setDialogOpen={setDialogOpen} />
                </DialogContent>
              </Dialog>
            )}
            <div className=" m-auto mt-4 gap-5 overflow-x-scroll rounded-md border-2 border-slate-600 bg-slate-200 p-4 sm:flex sm:max-w-screen-sm md:grid md:max-w-screen-md md:grid-flow-col lg:max-w-screen-lg">
              {groups.map((group) => {
                return (
                  <div
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group.id);
                    }}
                  >
                    <GroupCard
                      group={group}
                      selected={selectedGroup == group.id}
                    />
                  </div>
                );
              })}
            </div>
            <div>
              {selectedGroup ? (
                <div className="mt-4">
                  <GroupDetailsCard groupId={selectedGroup} />
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </>
        ) : (
          <div></div>
        )}
      </main>
    </>
  );
};

export default Dashboard;
