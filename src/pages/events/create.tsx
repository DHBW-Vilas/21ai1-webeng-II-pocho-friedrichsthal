"use client";

import { api } from "@/src/utils/api";
import dayjs from "dayjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, PlusIcon } from "lucide-react";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import Navbar from "@/src/components/navbar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/src/components/ui/command";
import { useState } from "react";

const formSchema = z.object({
  title: z.string(),
  description: z.string().max(2500).optional(),
  location: z.string().optional(),
  startAt: z.date(),
  endAt: z.date(),
  meetAt: z.date().optional(),
  notifyAt: z.date().optional(), //optional implementation
  visibleToGroups: z.array(z.string()).optional(), //UserGroup Ids
  lowestVisibleRole: z.nativeEnum(UserRole),
  musicSheetsNeeded: z.array(z.string()).optional(), //MusicSheet Ids
  relatedPosts: z.array(z.string()).optional(), //Post Ids
  categories: z.string().optional(), //category Ids
  groupsNeeded: z.array(z.string()).optional(), //UserGroup Ids
  usersNeeded: z.array(z.string()).optional(), //User Ids
});

export const CreateEventForm: NextPage = () => {
  const eventMutation = api.event.createEvent.useMutation();
  const userQuery = api.user.getSelf.useQuery();
  const router = useRouter();
  const categoriesQuery = api.category.getAllCategories.useQuery({});
  const usersQuery = api.user.getAll.useQuery();

  const [categorySearch, setCategorySearch] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      startAt: dayjs().toDate(),
      endAt: dayjs().add(1, "hour").toDate(),
      lowestVisibleRole: UserRole.GUEST,
    },
  });

  //generate if that looks into each query and if it isError, isLoading or data isn't there, return a loading div or an toast error message
  if (usersQuery.isError) {
    toast.error(usersQuery.error.message);
  }

  if (usersQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (categoriesQuery.isError) {
    toast.error(categoriesQuery.error.message);
  }

  if (categoriesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (userQuery.isError) {
    toast.error(userQuery.error.message);
  }

  if (!userQuery.isSuccess) {
    return <div>Loading...</div>;
  }

  if (!userQuery.data) {
    return <div>No user found</div>;
  }

  if (!categoriesQuery.data) {
    return <div>No categories found</div>;
  }
  if (!usersQuery.data) {
    return <div>No users found</div>;
  }

  const categories = categoriesQuery.data;
  const user = userQuery.data;

  if (eventMutation.isError) {
    toast.error(eventMutation.error.message);
  }

  if (eventMutation.isSuccess) {
    toast.success("Event created! Redirecting...");
    //wait for 5 seconds
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push("/events");
    }, 5000);
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event Title" {...field} required />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Event Location" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Event Description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex flex-row justify-evenly gap-2">
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>From</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP, p")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                    <Input
                      type="time"
                      className="w-full"
                      {...field}
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const date = field.value ?? dayjs();
                        date.setHours(parseInt(hours as string));
                        date.setMinutes(parseInt(minutes as string));
                        form.setValue(
                          "endAt",
                          dayjs(date).add(1, "hour").toDate()
                        );
                        field.onChange(date);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>To</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP, p")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01") ||
                        date <
                          dayjs(form.getValues().startAt)
                            .set("hour", 0)
                            .set("minute", 0)
                            .subtract(1, "minute")
                            .toDate()
                      }
                      initialFocus
                    />
                    <Input
                      type="time"
                      className="w-full"
                      {...field}
                      value={field.value ? format(field.value, "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const date = field.value ?? new Date();
                        date.setHours(parseInt(hours as string));
                        date.setMinutes(parseInt(minutes as string));
                        field.onChange(date);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Time to Meet</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    className="w-full"
                    {...field}
                    value={field.value ? format(field.value, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":");
                      const date = field.value ?? new Date();
                      date.setHours(parseInt(hours as string));
                      date.setMinutes(parseInt(minutes as string));
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex w-full flex-row justify-evenly gap-2">
          <FormField
            control={form.control}
            name="lowestVisibleRole"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel>Lowest Visible Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(UserRole).map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        disabled={
                          (user.role === UserRole.GUEST &&
                            role !== UserRole.GUEST) ||
                          (user.role === UserRole.MEMBER &&
                            role === UserRole.ADMIN)
                        }
                        defaultChecked={role === user.role}
                      >
                        {role.replace(
                          /(\w)(\w*)/g,
                          function (g0, g1: string, g2: string) {
                            return g1.toUpperCase() + g2.toLowerCase();
                          }
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel>Category</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? categories.find((cat) => cat.id === field.value)
                              ?.name
                          : "Select a category"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search Categories..."
                        autoFocus
                        onValueChange={(e) => {
                          setCategorySearch(e);
                        }}
                      />
                      <CommandEmpty>
                        <span className="text-muted-foreground">
                          No categories found
                        </span>
                      </CommandEmpty>
                      <CommandGroup>
                        {categories.map((cat) => (
                          <CommandItem
                            value={cat.id}
                            key={cat.id}
                            onSelect={(value) => {
                              form.setValue("categories", value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                cat.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {cat.name}
                          </CommandItem>
                        ))}
                        {categorySearch !== "" && (
                          <CommandItem
                            value={categorySearch}
                            onSelect={(value) => {
                              form.setValue("categories", value);
                            }}
                          >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create category {categorySearch}
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          className="w-full"
          onClick={() => {
            const values = form.getValues();

            //check if required fields are filled
            if (!values.title || values.title === "") {
              toast.error("Title is required");
              return;
            }
            if (!values.startAt) {
              toast.error("Start date is required");
              return;
            }
            if (!values.endAt) {
              toast.error("End date is required");
              return;
            }
            if (!values.lowestVisibleRole) {
              toast.error("Lowest visible role is required");
              return;
            }

            if (values.startAt > values.endAt) {
              toast.error("Start date cannot be after end date");
              return;
            }
            if (values.meetAt && values.meetAt > values.startAt) {
              toast.error("Meet date cannot be after start date");
              return;
            }
            if (values.notifyAt && values.notifyAt > values.startAt) {
              toast.error("Notify date cannot be after start date");
              return;
            }

            eventMutation.mutate(form.getValues());
          }}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

const CreateEventPage: NextPage = () => {
  return (
    <>
      <Navbar />
      <main>
        <CreateEventForm />
      </main>
    </>
  );
};

export default CreateEventPage;
