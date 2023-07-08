import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  createTRPCRouter,
  loggedinProcedure,
  memberProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { Instrument, UserRole } from "@prisma/client";

export const userRouter = createTRPCRouter({
  getAll: memberProcedure.query(async ({ ctx }) => {
    //get role of user that is logged in (ctx.userId)
    //if role is admin, return all users
    //if role is member, return only userNames of members

    const currentUser = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.userId,
      },
    });

    if (!currentUser) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    if (currentUser.role === "ADMIN") {
      return ctx.prisma.user.findMany();
    }
    if (currentUser.role === "MEMBER") {
      return ctx.prisma.user.findMany();
    }
    return new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient permissions",
    });
  }),
  getOne: loggedinProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: input.userId,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),
  getOneByDisplayName: loggedinProcedure
    .input(z.object({ displayName: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          displayName: input.displayName,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),
  getSelf: loggedinProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.userId,
      },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  getSelfPublic: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return null;
    }
    const user = await ctx.prisma.user.findUnique({
      where: {
        clerkId: ctx.userId,
      },
    });
    if (!user) {
      return null;
    }
    return user;
  }),
  updateUser: adminProcedure
    .input(
      z.object({
        clerkId: z.string(),
        displayName: z.string().optional(),
        primaryInstrument: z.nativeEnum(Instrument).optional(),
        secondaryInstrument: z.nativeEnum(Instrument).optional(),
        role: z.nativeEnum(UserRole).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        startedAt: z.date().optional(),
        email: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: input.clerkId,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      //check if user already exists (display name)
      if (input.displayName) {
        const existingUserName = await ctx.prisma.user.findUnique({
          where: {
            displayName: input.displayName,
          },
        });
        if (existingUserName && existingUserName.clerkId !== input.clerkId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User with displayName already exists",
          });
        }
      }

      //check if user already exists (email)
      if (input.email) {
        const existingUserEmail = await ctx.prisma.user.findUnique({
          where: {
            email: input.email,
          },
        });

        if (existingUserEmail && existingUserEmail.clerkId !== input.clerkId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User with email already exists",
          });
        }
      }

      const updatedUser = await ctx.prisma.user.update({
        where: {
          clerkId: input.clerkId,
        },
        data: {
          displayName: input.displayName,
          primaryInstrument: input.primaryInstrument || user.primaryInstrument,
          secondaryInstrument:
            input.secondaryInstrument || user.secondaryInstrument || null,
          role: input.role || user.role,
          firstName: input.firstName || user.firstName || null,
          lastName: input.lastName || user.lastName || null,
          email: input.email || user.email || null,
          startedAt: input.startedAt || user.startedAt || null,
        },
      });

      return updatedUser;
    }),

  getGroupsOfUser: memberProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      let user;
      if (!input.userId) {
        user = await ctx.prisma.user.findUnique({
          where: {
            clerkId: ctx.userId,
          },
        });
      } else {
        user = await ctx.prisma.user.findUnique({
          where: {
            clerkId: input.userId,
          },
        });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return ctx.prisma.userGroup.findMany({
        where: {
          users: {
            some: {
              clerkId: user.clerkId,
            },
          },
        },
      });
    }),

  createUser: loggedinProcedure
    .input(
      z.object({
        displayName: z.string(),
        primaryInstrument: z.nativeEnum(Instrument),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        imageUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.displayName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "displayName is required",
        });
      }
      if (!input.primaryInstrument) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "primaryInstrument is required",
        });
      }

      //check if user already exists (display name)
      const existingUserName = await ctx.prisma.user.findUnique({
        where: {
          displayName: input.displayName,
        },
      });
      if (existingUserName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User with this name already exists",
        });
      }

      //check if user already exists (clerkId)
      const existingUserClerkId = await ctx.prisma.user.findUnique({
        where: {
          clerkId: ctx.userId,
        },
      });
      if (existingUserClerkId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User with this clerkId already exists",
        });
      }

      const existingUserEmail = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (existingUserEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User with this email already exists",
        });
      }

      return ctx.prisma.user.create({
        data: {
          displayName: input.displayName,
          clerkId: ctx.userId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          primaryInstrument: input.primaryInstrument,
          firstName: input.firstName || "",
          lastName: input.lastName || "",
          email: input.email || "",
          imageUrl: input.imageUrl,
        },
      });
    }),
});
