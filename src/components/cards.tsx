import { type UserGroup, type User } from "@prisma/client";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "react-hot-toast";
import { EditButton } from "./buttons";
import { Card } from "./ui/card";
import Image from "next/image";
import { Tag } from "./tag";
import { type Event } from "@prisma/client";
import dayjs from "dayjs";
import { Button } from "./ui/button";
import { LoadingPage } from "./loading";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../utils/api";
import { PostPreview } from "./postPreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { UpdateGroupForm } from "./createGroupForm";

type RouterOutput = inferRouterOutputs<AppRouter>;
type DetailedNews = RouterOutput["post"]["getAllPostsVisibleToUser"][number];
type DetailedGroup = RouterOutput["group"]["getAllGroups"][number];

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
                <Tag type="general" message={group.name} />
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

const UserCardDetailsReduced = (userState: User) => {
  const role = userState.role.toString().toLocaleLowerCase();

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

      <div className="flex flex-row gap-2">
        <span className="font-thin text-slate-400">
          {"@" + userState.displayName}
        </span>{" "}
        <Tag message={role} type="role" role={userState.role} />
      </div>
    </div>
  );
};

export const UserCard = (props: {
  user: User;
  isAdmin?: boolean;
  reduced?: boolean;
}) => {
  const updateUserMutation = api.user.updateUser.useMutation();
  const router = useRouter();

  const [userState, setUser] = useState(props.user);

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

  return props.reduced ? (
    <Card className="relative flex h-20 w-fit justify-around gap-6 p-2 align-middle">
      <Image
        src={userState.imageUrl ? userState.imageUrl : "/default-profile.png"}
        alt="Profile Picture"
        className="m-auto h-14 w-14 justify-center rounded-full"
        width={52}
        height={52}
      />
      <div className="w-fit">
        <UserCardDetailsReduced {...userState} />
      </div>
    </Card>
  ) : (
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

export const EventCardDetails = (event: Event) => {
  return (
    <div>
      <div className="flex flex-col justify-center">
        <div className="">
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p className="text-sm">{event.description}</p>
          <div className="grid grid-flow-dense grid-cols-8">
            <p className="col-span-2">From:</p>
            <p className="col-span-6">
              {dayjs(event.startAt).format("ddd, DD.MM.YY HH:mm")}
            </p>
            {event.startAt.toLocaleDateString() ===
            event.endAt.toLocaleDateString() ? (
              <div className="col-span-8 grid grid-cols-8">
                <p className="col-span-2">Duration:</p>
                <p className="col-span-6">
                  {dayjs(event.endAt).diff(dayjs(event.startAt), "hours")} hours
                </p>
              </div>
            ) : (
              <div className="col-span-8 grid grid-cols-8">
                <p className="col-span-2">To:</p>
                <p className="col-span-6">
                  {dayjs(event.endAt).format("ddd, DD.MM.YY HH:mm")}
                </p>
              </div>
            )}
          </div>
          {event.location != "" && event.location != null ? (
            <div className="grid grid-flow-dense grid-cols-8">
              <p className="col-span-2">Location:</p>
              <p className="col-span-6">{event.location}</p>
            </div>
          ) : null}
          <div className="grid grid-flow-dense grid-cols-8">
            <p className="col-span-2">Visible To:</p>
            <p className="col-span-6">
              <Tag
                type="role"
                role={event.visible ? event.lowestVisibleRole : "NOBODY"}
                message={event.visible ? event.lowestVisibleRole : "NOBODY"}
              />
            </p>
          </div>
          <div className="grid grid-flow-dense grid-cols-8">
            <p className="col-span-2">Review:</p>
            <p className="col-span-6">
              <Tag type="review" review={event.review} message={event.review} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventCardDetailsReduced = (event: Event) => {
  return (
    <div>
      <div className="flex flex-col justify-center">
        <h3 className="text-center text-lg font-bold">{event.title}</h3>
        <hr className="h-0.5 rounded-lg bg-slate-600" />
        <div className="grid grid-flow-dense grid-cols-8">
          <p className="col-span-2">From:</p>
          <p className="col-span-6">
            {dayjs(event.startAt).format("ddd, DD.MM.YY HH:mm")}
          </p>
          {event.startAt.toLocaleDateString() ===
          event.endAt.toLocaleDateString() ? (
            <div className="col-span-8 grid grid-cols-8">
              <p className="col-span-2">Duration:</p>
              <p className="col-span-6">
                {dayjs(event.endAt).diff(dayjs(event.startAt), "hours")} hours
              </p>
            </div>
          ) : (
            <div className="col-span-8 grid grid-cols-8">
              <p className="col-span-2">To:</p>
              <p className="col-span-6">
                {dayjs(event.endAt).format("ddd, DD.MM.YY HH:mm")}
              </p>
            </div>
          )}
        </div>
        {event.location != "" && event.location != null ? (
          <div className="grid grid-flow-dense grid-cols-8">
            <p className="col-span-2">Location:</p>
            <p className="col-span-6">{event.location}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const EventCard = (props: {
  event: Event;
  isAdmin?: boolean;
  reduced?: boolean;
}) => {
  const { event, isAdmin, reduced } = props;

  const updateEventMutation = api.event.updateEvent.useMutation();
  const deleteEventMutation = api.event.deleteEvent.useMutation();
  const setEventVisibleMutation = api.event.setVisible.useMutation();
  const setEventInVisibleMutation = api.event.setInvisible.useMutation();
  const approveEventMutation = api.event.approveEvent.useMutation();
  const rejectEventMutation = api.event.rejectEvent.useMutation();

  const router = useRouter();

  const [eventState, setEvent] = useState(event);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (updateEventMutation.isError) {
    toast.error("Error updating event " + updateEventMutation.error.message);
  }
  if (updateEventMutation.isSuccess) {
    toast.success("User updated successfully");
    setEvent(updateEventMutation.data);

    void router.push("/user");
  }

  return reduced ? (
    <div>
      <Card className="relative h-28 w-full max-w-sm justify-around gap-6 bg-white p-2 align-middle">
        <div>
          <EventCardDetailsReduced {...eventState} />
        </div>
      </Card>
    </div>
  ) : (
    <Card className="relative h-72 w-96 justify-around gap-6 bg-slate-100 p-2 align-middle">
      <EditButton
        className={!isAdmin ? "none" : ""}
        onClick={() => {
          void router.push(`/events/${event.id}/update`);
        }}
      />
      <div>
        <EventCardDetails {...eventState} />
      </div>
      <div className="absolute inset-x-0 bottom-0 mx-2 mb-2 flex flex-row justify-between">
        <>
          <Button
            className="mr-1 w-1/4 duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-green-500"
            variant={"outline"}
            disabled={
              eventState.review === "REJECTED" ||
              eventState.review === "APPROVED"
            }
            onClick={() => {
              approveEventMutation.mutate({ id: event.id });
              setEvent({ ...eventState, review: "APPROVED" });
            }}
          >
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
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </Button>
          <Button
            className="mr-1 w-1/4 duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-red-500"
            variant={"outline"}
            disabled={
              eventState.review === "REJECTED" ||
              eventState.review === "APPROVED"
            }
            onClick={() => {
              rejectEventMutation.mutate({ id: event.id });
              setEvent({ ...eventState, review: "REJECTED" });
            }}
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </>

        <Button
          className="ransition mx-1 w-full duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-red-500"
          variant={confirmDelete ? "destructive" : "outline"}
          onClick={() => {
            if (confirmDelete) {
              deleteEventMutation.mutate({ id: event.id });
            } else {
              setConfirmDelete(true);
              setTimeout(() => {
                setConfirmDelete(false);
              }, 5000);
            }
          }}
        >
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
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </Button>
        <Button
          variant={"outline"}
          className={
            "hover: ml-1  w-full duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110" +
            (eventState.visible ? "bg-red-900" : "bg-green-900")
          }
          disabled={
            eventState.review === "PENDING" || eventState.review === "REJECTED"
          }
          onClick={() => {
            if (eventState.visible) {
              void setEventInVisibleMutation.mutate({ id: eventState.id });
            } else {
              void setEventVisibleMutation.mutate({ id: eventState.id });
            }
            setEvent({ ...eventState, visible: !eventState.visible });
          }}
        >
          {!eventState.visible ? (
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
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : (
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
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          )}
        </Button>
      </div>
    </Card>
  );
};

export const GroupCard = (props: { group: UserGroup; selected: boolean }) => {
  const getSelfQuery = api.user.getSelf.useQuery();
  const getGroupParticipants = api.group.getAllOfGroup.useQuery({
    groupId: props.group.id,
  });

  const { group, selected } = props;

  if (getGroupParticipants.isLoading || !getGroupParticipants.data) {
    return <LoadingPage />;
  }
  if (getSelfQuery.isError) {
    toast.error("Error loading group participants");
    return <Skeleton className="h-20 w-48" />;
  }

  if (getGroupParticipants.isError) {
    toast.error("Error loading group participants");
    return <Skeleton className="h-20 w-48" />;
  }
  if (getSelfQuery.isLoading || !getSelfQuery.data) {
    return <LoadingPage />;
  }

  const participants = getGroupParticipants.data;
  const participantsCount = participants.length;

  return (
    <Card
      className={
        "relative h-20 w-48 justify-around gap-6 border-2 p-2 align-middle  hover:cursor-pointer" +
        (selected
          ? " border-primary bg-slate-500 text-slate-100"
          : "border-slate-600 bg-slate-100 hover:bg-slate-500 hover:text-slate-100")
      }
    >
      <div></div>
      <div className="flex flex-col justify-between">
        <h3 className="text-lg font-bold">{group.name}</h3>
        <p className="text-sm">{participantsCount} participant(s)</p>
      </div>
    </Card>
  );
};

export const GroupDetailsCard = (props: { groupId: string }) => {
  const getSelfQuery = api.user.getSelf.useQuery();
  const getGroupQuery = api.group.getOne.useQuery({ groupId: props.groupId });

  const [dialogOpen, setDialogOpen] = useState(false);

  const [groupState, setGroup] = useState<DetailedGroup>({} as DetailedGroup);

  if (getGroupQuery.isLoading || !getGroupQuery.data) {
    return <LoadingPage />;
  }
  if (getSelfQuery.isError) {
    toast.error("Error loading group participants");
    return <Skeleton className="h-20 w-48" />;
  }

  if (getGroupQuery.isError) {
    toast.error("Error loading group participants");
    return <Skeleton className="h-20 w-48" />;
  }
  if (getSelfQuery.isLoading || !getSelfQuery.data) {
    return <LoadingPage />;
  }

  const isAdmin = getSelfQuery.data.role === "ADMIN";

  const group = getGroupQuery.data;
  const participantsCount = group.users.length;
  const participants = group.users;
  const eventCount = group.events.length;
  const events = group.events;

  if (!groupState.id || groupState.id !== group.id) {
    setGroup(group);
  }

  return (
    <Card className="relative m-auto justify-around gap-6 border-2 border-slate-600 bg-slate-100 p-2 align-middle  sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
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
            <EditButton className={!isAdmin ? "none" : ""} />
          </DialogTrigger>
          <DialogContent className="min-w-fit">
            <DialogHeader>
              <DialogTitle>Update Group</DialogTitle>
              <DialogDescription>Update the group.</DialogDescription>
            </DialogHeader>
            <UpdateGroupForm
              group={groupState}
              setGroup={setGroup}
              setDialogOpen={setDialogOpen}
            />
          </DialogContent>
        </Dialog>
      )}

      <div></div>
      <div className="flex flex-col justify-between">
        <h3 className="text-center text-xl font-extrabold">
          {groupState.name}
        </h3>
        <p className="text-center text-sm">{groupState.description}</p>
        <h4 className="text-lg font-bold">
          Participants: ({participantsCount})
        </h4>
        <div className="flex flex-row gap-2">
          {participants.map((participant) => (
            <UserCard
              key={group.id + participant.clerkId}
              user={participant}
              isAdmin={isAdmin}
              reduced
            />
          ))}
        </div>
        <hr className="my-4 h-0.5 w-full rounded-lg bg-slate-600 text-slate-600" />
        <h4 className="text-lg font-bold">Events: ({eventCount})</h4>
        <div className="flex flex-row gap-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} reduced />
          ))}
        </div>
      </div>
    </Card>
  );
};

export const PostCard = (props: {
  post: DetailedNews;
  isAdmin: boolean;
  includeMeta?: boolean;
}) => {
  const { post } = props;

  const deletePostMutation = api.post.deletePost.useMutation();
  const setPostVisibleMutation = api.post.setVisible.useMutation();
  const setPostInVisibleMutation = api.post.setInvisible.useMutation();
  const approvePostMutation = api.post.approvePost.useMutation();
  const rejectPostMutation = api.post.rejectPost.useMutation();
  const draftPostMutation = api.post.draftPost.useMutation();
  const publishPostMutation = api.post.publishPost.useMutation();

  const router = useRouter();

  const [postState, setPost] = useState(post);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="relative m-auto justify-around gap-6 border-2 border-slate-600 bg-slate-100 p-2 align-middle  sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
      <EditButton
        className={!props.isAdmin ? "none" : ""}
        onClick={() => {
          void router.push(`/news/${props.post.id}/update`);
        }}
      />
      <PostPreview
        post={postState}
        includeMeta={props.includeMeta}
        orientation="picLeft"
      />
      <div className=" inset-x-0 bottom-0 mx-2 mb-2 flex flex-row justify-between">
        <>
          <Button
            className="mr-1 w-1/4 duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-green-500"
            variant={"outline"}
            disabled={post.review === "REJECTED" || post.review === "APPROVED"}
            onClick={() => {
              approvePostMutation.mutate({ id: post.id });
              setPost({ ...postState, review: "APPROVED" });
            }}
          >
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
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </Button>
          <Button
            className="mr-1 w-1/4 duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-red-500"
            variant={"outline"}
            disabled={
              postState.review === "REJECTED" || postState.review === "APPROVED"
            }
            onClick={() => {
              rejectPostMutation.mutate({ id: post.id });
              setPost({ ...postState, review: "REJECTED" });
            }}
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </>

        <Button
          className="ransition mx-1 w-full duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-red-500"
          variant={confirmDelete ? "destructive" : "outline"}
          onClick={() => {
            if (confirmDelete) {
              deletePostMutation.mutate({ id: post.id });
              setTimeout(() => {
                void router.push("/dashboard?tab=posts");
                void router.reload();
              }, 1000);
            } else {
              setConfirmDelete(true);
              setTimeout(() => {
                setConfirmDelete(false);
              }, 5000);
            }
          }}
        >
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
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </Button>
        <Button
          variant={"outline"}
          className={
            "hover: ml-1  w-full duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110" +
            (postState.visible ? "bg-red-900" : "bg-green-900")
          }
          disabled={
            postState.review === "PENDING" || postState.review === "REJECTED"
          }
          onClick={() => {
            if (postState.visible) {
              void setPostInVisibleMutation.mutate({ id: postState.id });
            } else {
              void setPostVisibleMutation.mutate({ id: postState.id });
            }
            setPost({ ...postState, visible: !postState.visible });
          }}
        >
          {!postState.visible ? (
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
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : (
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
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          )}
        </Button>

        <Button
          variant={"outline"}
          className={
            "hover: ml-1  w-full duration-300 delay-150 ease-in-out hover:-translate-y-1 hover:scale-110 "
          }
          onClick={() => {
            if (postState.draft) {
              void publishPostMutation.mutate({ id: postState.id });
            } else {
              void draftPostMutation.mutate({ id: postState.id });
            }
            setPost({ ...postState, draft: !postState.draft });
          }}
        >
          {!postState.draft ? (
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          ) : (
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
                d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525"
              />
            </svg>
          )}
        </Button>
      </div>
    </Card>
  );
};
