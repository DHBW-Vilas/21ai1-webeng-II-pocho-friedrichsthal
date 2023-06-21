import {
  adminProcedure,
  createTRPCRouter,
  loggedinProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  getAllPosts: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const posts = await ctx.prisma.post.findMany({
        take: limit ?? 20,
        skip: offset ?? 0,
        include: {
          categories: true,
          mentionedUsers: true,
          relatedEvents: true,
        },
      });
      return posts;
    }),
  getAllVisiblePosts: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const posts = await ctx.prisma.post.findMany({
        where: {
          visible: true,
        },
        take: limit ?? 20,
        skip: offset ?? 0,
        include: {
          categories: true,
          mentionedUsers: true,
          relatedEvents: true,
        },
      });
      return posts;
    }),
  getAllVisiblePublicPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const posts = await ctx.prisma.post.findMany({
        where: {
          visible: true,
          lowestVisibleRole: UserRole.GUEST,
        },
        take: limit ?? 20,
        skip: offset ?? 0,
        include: {
          categories: true,
          mentionedUsers: true,
          relatedEvents: true,
        },
      });
      return posts;
    }),
  getAllPostsVisibleToUser: loggedinProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const user = await ctx.prisma.user.findUnique({
        where: {
          clerkId: ctx.userId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const rolesVisibleToUser = [];
      if (user.role === UserRole.ADMIN) {
        return await ctx.prisma.post.findMany({
          where: {
            visible: true,
            OR: [
              {
                lowestVisibleRole: UserRole.ADMIN,
              },
              {
                lowestVisibleRole: UserRole.MEMBER,
              },
              {
                lowestVisibleRole: UserRole.GUEST,
              },
            ],
          },
          take: limit ?? 20,
          skip: offset ?? 0,
          include: {
            categories: true,
            mentionedUsers: true,
            relatedEvents: true,
          },
        });
      } else if (user.role === UserRole.MEMBER) {
        return await ctx.prisma.post.findMany({
          where: {
            visible: true,
            OR: [
              {
                lowestVisibleRole: UserRole.MEMBER,
              },
              {
                lowestVisibleRole: UserRole.GUEST,
              },
            ],
          },
          take: limit ?? 20,
          skip: offset ?? 0,
          include: {
            categories: true,
            mentionedUsers: true,
            relatedEvents: true,
          },
        });
      } else {
        return await ctx.prisma.post.findMany({
          where: {
            visible: true,
            lowestVisibleRole: UserRole.GUEST,
          },
          take: limit ?? 20,
          skip: offset ?? 0,
          include: {
            categories: true,
            mentionedUsers: true,
            relatedEvents: true,
          },
        });
      }
    }),
});
