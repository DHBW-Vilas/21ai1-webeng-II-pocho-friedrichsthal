import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  loggedinProcedure,
  memberProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { Instrument } from "@prisma/client";

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
      return ctx.prisma.user.findMany({
        select: {
          displayName: true,
          role: true,
        },
      });
    }
    return new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient permissions",
    });
  }),
  getOne: memberProcedure.query(async ({ ctx }) => {
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
  getSelf: loggedinProcedure.query(async ({ ctx }) => {
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

  getAllGroups: loggedinProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userGroup.findMany();
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

  getAllOfGroup: memberProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.prisma.userGroup.findUnique({
        where: {
          id: input.groupId,
        },
      });
      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      return ctx.prisma.user.findMany({
        where: {
          UserGroups: {
            some: {
              id: input.groupId,
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
