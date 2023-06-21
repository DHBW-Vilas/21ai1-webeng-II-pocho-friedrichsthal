import { LoadingPage } from "@/src/components/loading";
import { api } from "@/src/utils/api";
import { type NextPage } from "next";
import { toast } from "react-hot-toast";
import Navbar from "@/src/components/navbar";
import { type Event } from "@prisma/client";
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
import { Tag } from "@/src/components/tag";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useState } from "react";
import { UpdateEventForm } from "./[eventId]/update";

export type FormEvent = {
  title: string;
  description: string;
  timespan: string;
  meetingTime: string;
  location: string;
  visible: boolean;
  authors: string[];
  groups: string[];
  roles: string[];
  musicSheets: string[];
  posts: number;
  participants: number;
};

const NewAdminEventPage: NextPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const columns: ColumnDef<Event>[] = [
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
      header: "Visible",
      accessorKey: "visible",
      cell: ({ row }) => {
        const visible: boolean = row.getValue("visible");
        if (visible === true) {
          return (
            <div
              className="text-center hover:cursor-pointer"
              onClick={() => {
                toast.success("Event is now invisible");
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
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          );
        } else {
          return (
            <div className="text-center hover:cursor-pointer">
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
            </div>
          );
        }
      },
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
      header: "Roles",
      accessorKey: "roles",
      cell: ({ row }) => {
        const roles: string[] = row.getValue("roles");
        return (
          <div>
            {roles.map((role) => {
              return (
                <Tag
                  key={role + row.index.toString()}
                  type="role"
                  message={role.replace(
                    /(\w)(\w*)/g,
                    function (g0, g1: string, g2: string) {
                      return g1.toUpperCase() + g2.toLowerCase();
                    }
                  )}
                  role={role}
                />
              );
            })}
          </div>
        );
      },
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
      cell: ({ row }) => {
        const event: Event = row.original;

        return (
          <Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => {
                      setDialogOpen(true);
                    }}
                  >
                    Update Event
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <UpdateEventForm event={event} />
                </DialogContent>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View customer</DropdownMenuItem>
                <DropdownMenuItem>View payment details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Dialog>
        );
      },
    },
  ];

  //query for all events
  const allEventsQuery = api.event.getAllEvents.useQuery();
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
      visible: event.visible,
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
          <Button className="flex w-fit justify-items-end justify-self-end text-right">
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
                  No results.
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
      <main className="max-w-screen-2xl">
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
