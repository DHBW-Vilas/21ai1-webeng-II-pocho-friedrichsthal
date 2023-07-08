import { z } from "zod";

import {
  adminProcedure,
  createTRPCRouter,
  loggedinProcedure,
  memberProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const eventRouter = createTRPCRouter({
  getReviewEvents: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: { review: "PENDING" },
    });
  }),

  getOneReviewEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (event.review === "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is already approved",
        });
      } else if (event.review === "REJECTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event got rejected",
        });
      } else {
        return event;
      }
    }),

  setVisible: memberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: { users: true },
      });
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (event.review !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is not approved",
        });
      }

      //check if user is admin or author
      //get all authors
      const authors = event.users.filter((user) => user.relation === "AUTHOR");
      //check if user is admin
      if (user.role === UserRole.ADMIN) {
        //set visible
        const updatedEvent = await ctx.prisma.event.update({
          where: { id: input.id },
          data: { visible: true },
        });
        return updatedEvent;
      }
      //check if user is author
      else if (authors.some((author) => author.userClerkId === user.clerkId)) {
        //set visible
        const updatedEvent = await ctx.prisma.event.update({
          where: { id: input.id },
          data: { visible: true },
        });
        return updatedEvent;
      }

      //if not admin or author, throw error
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not admin or author",
      });
    }),

  setInvisible: memberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: { users: true },
      });
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      //check if user is admin or author
      //get all authors
      const authors = event.users.filter((user) => user.relation === "AUTHOR");
      //check if user is admin
      if (user.role === UserRole.ADMIN) {
        //set invisible
        const updatedEvent = await ctx.prisma.event.update({
          where: { id: input.id },
          data: { visible: false },
        });
        return updatedEvent;
      }
      //check if user is author
      else if (authors.some((author) => author.userClerkId === user.clerkId)) {
        //set invisible
        const updatedEvent = await ctx.prisma.event.update({
          where: { id: input.id },
          data: { visible: false },
        });
        return updatedEvent;
      }

      //if not admin or author, throw error
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not admin or author",
      });
    }),

  approveEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), review: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }
      return await ctx.prisma.event.update({
        where: { id: input.id },
        data: { review: "APPROVED" },
      });
    }),

  rejectEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: { users: true },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      //create notification for author(s)
      const authors = event.users.filter((user) => user.relation === "AUTHOR");
      const authorIds = authors.map((author) => author.userClerkId);

      await ctx.prisma.userNotification.createMany({
        data: authorIds.map((authorId) => ({
          userClerkId: authorId,
          eventId: event.id,
          title: "Event Rejected",
          content: `Your event ${event.title} has been rejected`,
          type: "EVENT_REJECTED",
        })),
      });

      return await ctx.prisma.event.update({
        where: { id: input.id },
        data: { review: "REJECTED", visible: false },
      });
    }),

  getEventAuthor: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: { users: true },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }
      return event.users.filter((user) => user.relation === "AUTHOR");
    }),

  getEventAttendees: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: { users: true },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }
      return event.users.filter((user) => user.relation === "PARTICIPANT");
    }),
  /**
   * getVisibleEventsByAuthor
   * params: id (string) - clerkId of the author
   * returns: array of events
   * description: returns all events created by the author that are visible to the user
   *              (based on the user's role or group)
   * throws: NOT_FOUND if the user is not found
   */
  getVisibleEventsByAuthor: loggedinProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      if (user.role === UserRole.GUEST) {
        return await ctx.prisma.event.findMany({
          where: {
            users: { some: { id: input.id, relation: "AUTHOR" } },
            visible: true,
            lowestVisibleRole: UserRole.GUEST,
          } || {
            users: { some: { id: input.id, relation: "AUTHOR" } },
            visible: true,
            userGroups: { some: { users: { some: { id: ctx.userId } } } },
          },
        });
      } else if (user.role === UserRole.MEMBER) {
        return await ctx.prisma.event.findMany({
          where: {
            users: { some: { id: input.id, relation: "AUTHOR" } },
            visible: true,
            lowestVisibleRole: UserRole.GUEST || UserRole.MEMBER,
          } || {
            users: { some: { id: input.id, relation: "AUTHOR" } },
            visible: true,
            userGroups: { some: { users: { some: { id: ctx.userId } } } },
          },
        });
      } else if (user.role === UserRole.ADMIN) {
        return await ctx.prisma.event.findMany({
          where: {
            users: { some: { id: input.id, relation: "AUTHOR" } },
            visible: true,
          },
        });
      }
    }),

  /**
   * getAllPublicVisible
   * params: none
   * returns: array of events
   * description: returns all events that are visible to the user
   *              (based on the user's role or group)
   */
  getAllPublicVisible: publicProcedure.query(async ({ ctx }) => {
    //check if user is logged in
    if (ctx.userId) {
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.role === UserRole.GUEST) {
        return await ctx.prisma.event.findMany({
          where: {
            visible: true,
            lowestVisibleRole: UserRole.GUEST,
          } || {
            visible: true,
            userGroups: { some: { users: { some: { id: ctx.userId } } } },
          },
        });
      } else if (user.role === UserRole.MEMBER) {
        return await ctx.prisma.event.findMany({
          where: {
            visible: true,
            lowestVisibleRole: UserRole.GUEST || UserRole.MEMBER,
          } || {
            visible: true,
            userGroups: { some: { users: { some: { id: ctx.userId } } } },
          },
        });
      } else if (user.role === UserRole.ADMIN) {
        return await ctx.prisma.event.findMany({
          where: {
            visible: true,
          },
        });
      }
    }
    //if user is not logged in
    return ctx.prisma.event.findMany({
      where: { visible: true, lowestVisibleRole: UserRole.GUEST },
    });
  }),
  /**
   * getOnePublic
   * params: id (string) - id of the event
   * returns: event
   * description: returns the event with the given id if it is visible to the user
   *             (based on the user's role or group)
   */
  getOnePublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      //get event
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: { userGroups: { include: { users: true } }, users: true },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }
      //check if user is logged in
      if (ctx.userId) {
        const user = await ctx.prisma.user.findUnique({
          where: { clerkId: ctx.userId },
        });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (user.role === UserRole.GUEST) {
          if (event.visible && event.lowestVisibleRole === UserRole.GUEST) {
            return event;
          } else if (
            event.visible &&
            event.userGroups.some((group) =>
              group.users.some((groupUser) => groupUser.clerkId === ctx.userId)
            )
          ) {
            return event;
          } else {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Event not found",
            });
          }
        } else if (user.role === UserRole.MEMBER) {
          if (
            event.visible &&
            (event.lowestVisibleRole === UserRole.GUEST ||
              event.lowestVisibleRole === UserRole.MEMBER)
          ) {
            return event;
          } else if (
            event.visible &&
            event.userGroups.some((group) =>
              group.users.some((groupUser) => groupUser.clerkId === ctx.userId)
            )
          ) {
            return event;
          } else {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Event not found",
            });
          }
        } else if (user.role === UserRole.ADMIN) {
          if (event.visible) {
            return event;
          } else {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Event not found",
            });
          }
        }
      }
      //if user is not logged in
      if (event.visible && event.lowestVisibleRole === UserRole.GUEST) {
        return event;
      }
    }),

  getAllMemberEvents: memberProcedure.query(({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: { visible: true, lowestVisibleRole: UserRole.MEMBER },
    });
  }),
  getOneMemberEvent: memberProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: {
          userGroups: { include: { users: true } },
          users: { include: { user: true } },
          musicSheets: true,
          relatedPosts: true,
          category: true,
        },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (event.lowestVisibleRole === UserRole.MEMBER && !event.visible) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      } else if (event.lowestVisibleRole != UserRole.MEMBER) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to view this event",
        });
      } else {
        return event;
      }
    }),
  getAllAdminEvents: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.event.findMany({
      where: { visible: true, lowestVisibleRole: UserRole.ADMIN },
    });
  }),
  getOneAdminEvent: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      if (event.lowestVisibleRole === UserRole.ADMIN && !event.visible) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      } else if (event.lowestVisibleRole != UserRole.ADMIN) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to view this event",
        });
      } else {
        return event;
      }
    }),
  getOne: memberProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: {
          userGroups: { include: { users: true } },
          users: { include: { user: true } },
          musicSheets: true,
          relatedPosts: true,
          category: true,
        },
      });
      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }

      //check if user is author or admin
      if (ctx.userId) {
        const user = await ctx.prisma.user.findUnique({
          where: { clerkId: ctx.userId },
        });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (
          user.role === UserRole.ADMIN ||
          event.users.some(
            (eventUser) =>
              eventUser.user.clerkId === ctx.userId &&
              eventUser.relation == "AUTHOR"
          )
        ) {
          return event;
        }
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authorized to view this event",
      });
    }),
  getAllEventsVisibleToUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return ctx.prisma.event.findMany({
        where: { visible: true, lowestVisibleRole: UserRole.GUEST },
        include: {
          userGroups: { include: { users: true } },
          users: { include: { user: true } },
          musicSheets: true,
          relatedPosts: true,
        },
      });
    }

    const user = await ctx.prisma.user.findUnique({
      where: { clerkId: ctx.userId },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (user.role === UserRole.GUEST) {
      //return all events visible to guests or groups the user is in
      return ctx.prisma.event.findMany({
        where: {
          visible: true,
          OR: [
            { lowestVisibleRole: UserRole.GUEST },
            {
              userGroups: {
                some: { users: { some: { clerkId: ctx.userId } } },
              },
            },
            { users: { some: { userClerkId: ctx.userId } } },
          ],
        },
        include: {
          userGroups: { include: { users: true } },
          users: { include: { user: true } },
          musicSheets: true,
          relatedPosts: true,
        },
      });
    } else if (user.role === UserRole.MEMBER) {
      return ctx.prisma.event.findMany({
        where: {
          visible: true,
          OR: [
            { lowestVisibleRole: UserRole.GUEST },
            { lowestVisibleRole: UserRole.MEMBER },
            {
              userGroups: {
                some: { users: { some: { clerkId: ctx.userId } } },
              },
            },
          ],
        },
        include: {
          userGroups: { include: { users: true } },
          users: { include: { user: true } },
          musicSheets: true,
          relatedPosts: true,
        },
      });
    } else if (user.role === UserRole.ADMIN) {
      return ctx.prisma.event.findMany({
        where: {
          visible: true,
          OR: [
            { lowestVisibleRole: UserRole.GUEST },
            { lowestVisibleRole: UserRole.MEMBER },
            { lowestVisibleRole: UserRole.ADMIN },
          ],
        },
        include: {
          userGroups: { include: { users: true } },
          users: { include: { user: true } },
          musicSheets: true,
          relatedPosts: true,
        },
      });
    }
  }),

  getAllEvents: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.event.findMany({
      include: {
        userGroups: true,
        musicSheets: true,
        relatedPosts: true,
        category: true,
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }),
  createEvent: memberProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        startAt: z.date(),
        endAt: z.date(),
        meetAt: z.date().optional(),
        notifyAt: z.date().optional(), //optional implementation
        visibleToGroups: z.array(z.string()).optional(), //UserGroup Ids
        lowestVisibleRole: z.nativeEnum(UserRole).default(UserRole.GUEST),
        musicSheetsNeeded: z.array(z.string()).optional(), //MusicSheet Ids
        relatedPosts: z.array(z.string()).optional(), //Post Ids
        category: z.string().optional(), //Tag Ids
        groupsNeeded: z.array(z.string()).optional(), //UserGroup Ids
        usersNeeded: z.array(z.string()).optional(), //User Ids
      })
    )
    .mutation(async ({ ctx, input }) => {
      //get userRole
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
        select: { role: true, displayName: true, clerkId: true },
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      //generate EventId
      const event = await ctx.prisma.event.create({
        data: {
          title: input.title,
          description: input.description,
          location: input.location,
          review: user.role === UserRole.MEMBER ? "PENDING" : "APPROVED", //if user is member, the event needs to be reviewed by an admin
          startAt: input.startAt,
          endAt: input.endAt,
          meetAt: input.meetAt,
          notifyAt: input.notifyAt,
          lowestVisibleRole: input.lowestVisibleRole,
          visible: false,
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Event could not be created",
        });
      }

      //add groups
      if (input.groupsNeeded) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            userGroups: {
              connect: input.groupsNeeded.map((id) => ({ id })),
            },
          },
        });
      }

      //create users
      const users = [];
      users.push(
        await ctx.prisma.eventUser.create({
          data: {
            event: { connect: { id: event.id } },
            user: { connect: { clerkId: ctx.userId } },
            relation: "AUTHOR",
          },
        })
      );

      if (input.usersNeeded) {
        for (const userId of input.usersNeeded) {
          users.push(
            await ctx.prisma.eventUser.create({
              data: {
                event: { connect: { id: event.id } },
                user: { connect: { clerkId: userId } },
              },
            })
          );
        }
      }
      //update event
      await ctx.prisma.event.update({
        where: { id: event.id },
        data: {
          users: {
            connect: users.map((user) => ({ id: user.id })),
          },
        },
      });

      //add music sheets
      if (input.musicSheetsNeeded) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            musicSheets: {
              connect: input.musicSheetsNeeded.map((id) => ({ id })),
            },
          },
        });
      }

      //add related posts
      if (input.relatedPosts) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            relatedPosts: {
              connect: input.relatedPosts.map((id) => ({ id })),
            },
          },
        });
      }

      //add categories
      if (input.category) {
        //get category
        const category = await ctx.prisma.category.findUnique({
          where: { id: input.category },
          select: { id: true },
        });
        if (!category) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Category not found",
          });
        }

        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            category: {
              connect: category,
            },
          },
        });
      }

      //check if neededGroups are missing in visibleToGroups
      if (input.visibleToGroups && input.groupsNeeded) {
        const neededGroups = input.groupsNeeded;
        const visibleGroups = input.visibleToGroups;
        const missingGroups = neededGroups.filter(
          (group) => !visibleGroups.includes(group)
        );
        if (missingGroups.length > 0) {
          visibleGroups.push(...missingGroups);
        }
      }
      //add visibleToGroups
      if (input.visibleToGroups) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            visibleToGroups: {
              connect: input.visibleToGroups.map((id) => ({ id })),
            },
          },
        });
      }

      if (event.review === "PENDING") {
        //send notification to admins
        const admins = await ctx.prisma.user.findMany({
          where: { role: UserRole.ADMIN },
          select: { clerkId: true },
        });
        if (admins) {
          await ctx.prisma.userNotification.createMany({
            data: admins.map((admin) => ({
              userClerkId: admin.clerkId,
              eventId: event.id,
              title: "New Event",
              content: `${user.displayName} has created a new event`,
              type: "EVENT_REVIEW",
            })),
            skipDuplicates: true,
          });
        }
      }

      return event;
    }),
  updateEvent: memberProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        startAt: z.date().optional(),
        endAt: z.date().optional(),
        meetAt: z.date().optional(),
        notifyAt: z.date().optional(), //optional implementation
        visibleToGroups: z.array(z.string()).optional(), //UserGroup Ids
        lowestVisibleRole: z.nativeEnum(UserRole).optional(),
        musicSheetsNeeded: z.array(z.string()).optional(), //MusicSheet Ids
        relatedPosts: z.array(z.string()).optional(), //Post Ids
        category: z.string().optional(), //Tag Ids
        groupsNeeded: z.array(z.string()).optional(), //UserGroup Ids
        usersNeeded: z.array(z.string()).optional(), //User Ids
      })
    )
    .mutation(async ({ ctx, input }) => {
      //get userRole
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
        select: { role: true, displayName: true },
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      //get event
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: {
          users: true,
          userGroups: true,
          musicSheets: true,
          relatedPosts: true,
          category: true,
          visibleToGroups: true,
        },
      });
      if (!event) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Event not found",
        });
      }

      //check if user is author of event (or admin)
      const isAuthor = event.users.some(
        (user) => user.userClerkId === ctx.userId
      );
      if (!isAuthor && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not author",
        });
      }

      //update event
      await ctx.prisma.event.update({
        where: { id: event.id },
        data: {
          title: input.title,
          description: input.description,
          location: input.location,
          startAt: input.startAt,
          review: user.role === UserRole.MEMBER ? "PENDING" : "APPROVED", //Event needs to be reviewed again
          endAt: input.endAt,
          meetAt: input.meetAt,
          notifyAt: input.notifyAt,
          lowestVisibleRole: input.lowestVisibleRole,
        },
      });

      //add groups
      if (input.groupsNeeded) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            userGroups: {
              connect: input.groupsNeeded.map((id) => ({ id })),
            },
          },
        });
      }

      //create users
      const users = [];
      users.push(
        await ctx.prisma.eventUser.create({
          data: {
            event: { connect: { id: event.id } },
            user: { connect: { clerkId: ctx.userId } },
            relation: "AUTHOR",
          },
        })
      );

      if (input.usersNeeded) {
        for (const userId of input.usersNeeded) {
          users.push(
            await ctx.prisma.eventUser.create({
              data: {
                event: { connect: { id: event.id } },
                user: { connect: { clerkId: userId } },
              },
            })
          );
        }
      }
      //update event
      await ctx.prisma.event.update({
        where: { id: event.id },
        data: {
          users: {
            connect: users.map((user) => ({ id: user.id })),
          },
        },
      });

      //add music sheets
      if (input.musicSheetsNeeded) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            musicSheets: {
              connect: input.musicSheetsNeeded.map((id) => ({ id })),
            },
          },
        });
      }

      //add related posts
      if (input.relatedPosts) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            relatedPosts: {
              connect: input.relatedPosts.map((id) => ({ id })),
            },
          },
        });
      }

      //add categories
      if (input.category) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            category: {
              connect: { id: input.category },
            },
          },
        });
      }

      //check if neededGroups are missing in visibleToGroups
      if (input.visibleToGroups && input.groupsNeeded) {
        const neededGroups = input.groupsNeeded;
        const visibleGroups = input.visibleToGroups;
        const missingGroups = neededGroups.filter(
          (group) => !visibleGroups.includes(group)
        );
        if (missingGroups.length > 0) {
          visibleGroups.push(...missingGroups);
        }
      }
      //add visibleToGroups
      if (input.visibleToGroups) {
        await ctx.prisma.event.update({
          where: { id: event.id },
          data: {
            visibleToGroups: {
              connect: input.visibleToGroups.map((id) => ({ id })),
            },
          },
        });
      }

      if (event.review === "PENDING") {
        //send notification to admins
        const admins = await ctx.prisma.user.findMany({
          where: { role: UserRole.ADMIN },
          select: { clerkId: true },
        });
        if (!admins) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Admins not found",
          });
        }
        await ctx.prisma.userNotification.createMany({
          data: admins.map((admin) => ({
            userClerkId: admin.clerkId,
            title: "Event Updated",
            content: `The event ${event.title} has been updated and needs to be reviewed again`,
            type: "EVENT_REVIEW",
          })),
        });
      }

      return event;
    }),
  deleteEvent: memberProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      //get userRole
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
        select: { role: true },
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      //get event
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: {
          users: true,
          userGroups: true,
          musicSheets: true,
          relatedPosts: true,
          category: true,
          visibleToGroups: true,
        },
      });
      if (!event) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Event not found",
        });
      }

      //check if user is author of event (or admin)
      const isAuthor = event.users.some(
        (user) => user.userClerkId === ctx.userId
      );
      if (!isAuthor && user.role !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not author",
        });
      }
      //delete Notifications
      await ctx.prisma.userNotification.deleteMany({
        where: {
          relatedEvent: { id: event.id },
        },
      });

      //delete eventUsers
      await ctx.prisma.eventUser.deleteMany({
        where: { eventId: event.id },
      });

      //delete event
      await ctx.prisma.event.delete({
        where: { id: event.id },
      });

      return event;
    }),
  getAllFromSelf: loggedinProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.event.findMany({
      where: {
        users: { some: { userClerkId: ctx.userId, relation: "AUTHOR" } },
      },
      include: {
        category: true,
        userGroups: { include: { users: true } },
        users: { include: { user: true } },
        musicSheets: true,
        relatedPosts: true,
      },
    });
    return events;
  }),
});
