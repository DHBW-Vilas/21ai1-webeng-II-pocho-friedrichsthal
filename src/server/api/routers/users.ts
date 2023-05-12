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
          UserGroup: group,
        },
      });
    }),
  createUser: loggedinProcedure
    .input(
      z.object({
        displayName: z.string(),
        primaryInstrument: z.nativeEnum(Instrument),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: {
          displayName: input.displayName,
          clerkId: ctx.userId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          primaryInstrument: input.primaryInstrument,
        },
      });
    }),
});
