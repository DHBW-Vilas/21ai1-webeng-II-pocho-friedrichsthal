import {
  adminProcedure,
  createTRPCRouter,
  loggedinProcedure,
  memberProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const groupRouter = createTRPCRouter({
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
  addUserToGroup: adminProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.userGroup.findUnique({
        where: {
          id: input.groupId,
        },
      });
      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: input.userId,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      //check if user is already in group
      const existingUserGroup = await ctx.prisma.userGroup.findFirst({
        where: {
          id: input.groupId,
          users: {
            some: {
              clerkId: input.userId,
            },
          },
        },
      });
      if (existingUserGroup) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already in group",
        });
      }

      return ctx.prisma.userGroup.update({
        where: {
          id: input.groupId,
        },
        data: {
          users: {
            connect: {
              clerkId: input.userId,
            },
          },
        },
      });
    }),
  removeUserFromGroup: adminProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.prisma.userGroup.findUnique({
        where: {
          id: input.groupId,
        },
      });
      if (!group) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: input.userId,
        },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      //check if user is already in group
      const existingUserGroup = await ctx.prisma.userGroup.findFirst({
        where: {
          id: input.groupId,
          users: {
            some: {
              clerkId: input.userId,
            },
          },
        },
      });
      if (!existingUserGroup) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not in group",
        });
      }

      return ctx.prisma.userGroup.update({
        where: {
          id: input.groupId,
        },
        data: {
          users: {
            disconnect: {
              clerkId: input.userId,
            },
          },
        },
      });
    }),

  getOne: loggedinProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.userGroup.findUnique({
        where: {
          id: input.groupId,
        },
        include: {
          users: true,
          events: true,
        },
      });
    }),

  getAllGroups: loggedinProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userGroup.findMany({
      include: {
        users: true,
      },
    });
  }),
});
