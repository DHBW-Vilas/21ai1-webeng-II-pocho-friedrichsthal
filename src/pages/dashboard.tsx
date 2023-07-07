import { SignIn, useUser } from "@clerk/nextjs";
import { api } from "../utils/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";
import Head from "next/head";
import { type User } from "@prisma/client";
import { LoadingPage } from "../components/loading";
import { useState } from "react";
import { GroupCard, GroupDetailsCard, UserCard } from "../components/cards";
import { EventCard } from "../components/cards";

const Dashboard = () => {
  //check if user is signed in and check if role is member or admin
  const { isSignedIn } = useUser();
  const userQuery = api.user.getSelf.useQuery();
  const router = useRouter();

  if (!isSignedIn) {
    return (
      <div>
        <SignIn routing="path" path="/userSync" />
      </div>
    );
  }

  if (userQuery.isError || !userQuery.data) {
    toast.error("Error while fetching user data");
    void router.push("/", undefined, { shallow: true });
    return <div>Redirecting...</div>;
  }

  const role = userQuery.data.role;
  return (
    <main>
      <Navbar />
      {role === "ADMIN" ? <AdminDashboard /> : <MemberDashboard />}
    </main>
  );
};

const AdminDashboard = () => {
  const [selectedTab, setSelectedTab] = useState<
    "users" | "posts" | "events" | "groups"
  >("users");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mt-4 flex flex-col justify-center">
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
        {/* tabs */}
        {selectedTab === "users" ? (
          <div className="mt-4 grid grid-flow-col justify-center gap-5">
            {users.map((user) => {
              return <UserCard user={user} isAdmin key={user.clerkId} />;
            })}
          </div>
        ) : selectedTab === "posts" ? (
          <div></div>
        ) : selectedTab === "events" ? (
          <div className="mt-4 grid grid-flow-col justify-center gap-5">
            {events.map((event) => {
              return <EventCard event={event} isAdmin key={event.id} />;
            })}
          </div>
        ) : selectedTab === "groups" ? (
          <>
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

const MemberDashboard = () => {
  return <div>Member Dashboard</div>;
};

export default Dashboard;