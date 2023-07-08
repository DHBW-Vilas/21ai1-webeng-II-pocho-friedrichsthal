import { LoadingPage } from "@/src/components/loading";
import { api } from "@/src/utils/api";
import { type NextPage } from "next";
import { toast } from "react-hot-toast";
import Navbar from "@/src/components/navbar";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { UserNameHover } from "@/src/components/usernameHover";
import { Button } from "@/src/components/ui/button";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { CreateEventForm } from "./create";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useState } from "react";
import { type User } from "@prisma/client";
import { useUser } from "@clerk/nextjs";

export type FormEvent = {
  title: string;
  description: string;
  timespan: string;
  meetingTime: string;
  location: string;
  authors: string[];
  groups: string[];
  roles: string[];
  musicSheets: string[];
  posts: number;
  participants: number;
};

const NewAdminEventPage: NextPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: ColumnDef<FormEvent>[] = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Timespan",
      accessorKey: "timespan",
    },
    {
      header: "Meeting Time",
      accessorKey: "meetingTime",
    },
    {
      header: "Location",
      accessorKey: "location",
    },
    {
      header: "Authors",
      accessorKey: "authors",
      cell: ({ row }) => {
        const authors: string[] = row.getValue("authors");
        return (
          <div>
            {authors.map((author) => {
              return <UserNameHover key={author} displayName={author} />;
            })}
          </div>
        );
      },
    },
    {
      header: "Groups",
      accessorKey: "groups",
    },

    {
      header: "Music Sheets",
      accessorKey: "musicSheets",
    },
    {
      header: "Posts",
      accessorKey: "posts",
    },
    {
      header: "Participants",
      accessorKey: "participants",
    },
    {
      header: "",
      accessorKey: "actions",
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  //query for all events that the user can see
  const allEventsQuery = api.event.getAllEventsVisibleToUser.useQuery();
  if (allEventsQuery.isLoading) {
    return <LoadingPage />;
  }

  if (!allEventsQuery.data) {
    toast.error("Error while fetching Events");
  }
  const events = allEventsQuery.data;
  if (!events) return <div>No Events</div>;

  //create useful data for table
  const data: FormEvent[] = [];

  events.map((event) => {
    data.push({
      title: event.title,
      description: event.description ? event.description : "",
      timespan:
        event.startAt.toDateString() === event.endAt.toDateString()
          ? new Date(event.startAt).toLocaleString() +
            " - " +
            new Date(event.endAt).toLocaleTimeString()
          : new Date(event.startAt).toLocaleString() +
            " - " +
            new Date(event.endAt).toLocaleString(),
      meetingTime: event.meetAt
        ? event.meetAt.toDateString() === event.startAt.toDateString()
          ? new Date(event.meetAt).toLocaleTimeString()
          : new Date(event.meetAt).toLocaleString()
        : "",
      location: event.location ? event.location : "",
      authors: event.users.map((user) => {
        return user.user.displayName;
      }),
      groups: event.userGroups.map((group) => {
        return group.name;
      }),
      roles:
        event.lowestVisibleRole === "GUEST"
          ? ["GUEST"]
          : event.lowestVisibleRole === "MEMBER"
          ? ["GUEST", "MEMBER"]
          : ["GUEST", "MEMBER", "ADMIN"],
      musicSheets: event.musicSheets
        ? event.musicSheets.map((sheet) => {
            return sheet.name;
          })
        : [],
      posts: event.relatedPosts.length,
      participants: event.users.length,
    });
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
    />
  );
};
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function DataTable<TData, TValue>({
  columns,
  data,
  dialogOpen,
  setDialogOpen,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [user, setUser] = useState<User | null>(null);
  const { isSignedIn } = useUser();

  const getSelf = api.user.getSelfPublic.useQuery();

  if (getSelf.isLoading) {
    return <LoadingPage />;
  }

  if (isSignedIn && !user) {
    setUser(getSelf.data === undefined ? null : getSelf.data);
  }

  return (
    <div className="mt-3 flex  flex-col justify-evenly gap-1">
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
          <Button
            className="flex w-fit justify-items-end justify-self-end text-right"
            disabled={user === null || user.role === "GUEST"}
          >
            <div className="flex flex-row gap-1">
              <PlusIcon className="h-5 w-5" />
              New
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="min-w-fit"
          onSubmit={() => {
            console.log("submit");
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>Create a new event.</DialogDescription>
          </DialogHeader>
          <CreateEventForm />
        </DialogContent>
      </Dialog>
      <div className="max-w-screen-xl rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  There are no events visible to you at the moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const EventPage: NextPage = () => {
  return (
    <>
      <Navbar />
      <main className="m-auto max-w-screen-2xl">
        <div className="flex justify-center">
          <div className="">
            <NewAdminEventPage />
          </div>
        </div>
      </main>
    </>
  );
};

export default EventPage;
