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
  increasePostViewCount: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { postId } = input;
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: postId,
        },
      });
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const viewCount = post.timesVisited;
      await ctx.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          timesVisited: viewCount + 1,
        },
      });
      return true;
    }),

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
          author: true,
        },
        orderBy: {
          createdAt: "desc",
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
  getAllPostsVisibleToUser: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      if (!ctx.userId) {
        return await ctx.prisma.post.findMany({
          where: {
            visible: true,
            lowestVisibleRole: UserRole.GUEST,
            draft: false,
            review: "APPROVED",
          },
          include: {
            categories: true,
            mentionedUsers: true,
            relatedEvents: true,
            author: true,
          },
          take: limit ?? 20,
          skip: offset ?? 0,
        });
      }

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
      if (user.role === UserRole.ADMIN) {
        return await ctx.prisma.post.findMany({
          where: {
            visible: true,
            review: "APPROVED",
            draft: false,
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
            author: true,
          },
        });
      } else if (user.role === UserRole.MEMBER) {
        return await ctx.prisma.post.findMany({
          where: {
            visible: true,

            review: "APPROVED",
            draft: false,
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
            author: true,
          },
        });
      } else {
        return await ctx.prisma.post.findMany({
          where: {
            visible: true,
            review: "APPROVED",
            draft: false,
            lowestVisibleRole: UserRole.GUEST,
          },
          take: limit ?? 20,
          skip: offset ?? 0,
          include: {
            categories: true,
            mentionedUsers: true,
            relatedEvents: true,
            author: true,
          },
        });
      }
    }),
  getOneVisible: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const post = await ctx.prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          categories: true,
          mentionedUsers: true,
          relatedEvents: true,
          author: true,
        },
      });
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (!ctx.userId) {
        if (
          post.visible &&
          post.lowestVisibleRole === UserRole.GUEST &&
          post.review === "APPROVED" &&
          !post.draft
        ) {
          return post;
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to view this post",
          });
        }
      }

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

      if (
        user.role === UserRole.ADMIN &&
        post.visible &&
        post.review === "APPROVED" &&
        !post.draft
      ) {
        return post;
      }

      if (
        user.role === UserRole.MEMBER &&
        post.visible &&
        post.review === "APPROVED" &&
        !post.draft &&
        (post.lowestVisibleRole === UserRole.MEMBER ||
          post.lowestVisibleRole === UserRole.GUEST)
      ) {
        return post;
      }

      if (
        user.role === UserRole.GUEST &&
        post.visible &&
        post.review === "APPROVED" &&
        !post.draft &&
        post.lowestVisibleRole === UserRole.GUEST
      ) {
        return post;
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this post",
      });
    }),
  getAllFromSelf: loggedinProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      where: {
        author: {
          clerkId: ctx.userId,
        },
      },
      include: {
        categories: true,
        mentionedUsers: true,
        relatedEvents: true,
        author: true,
      },
    });
    return posts;
  }),
});
