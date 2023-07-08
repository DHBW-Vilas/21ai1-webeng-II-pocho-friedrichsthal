import {
  adminProcedure,
  createTRPCRouter,
  loggedinProcedure,
  memberProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const postRouter = createTRPCRouter({
  setVisible: memberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: { author: true },
      });
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.review !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is not approved",
        });
      }

      //check if user is admin or author
      //check if user is admin
      if (user.role === UserRole.ADMIN) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { visible: true },
        });
        return updatedPost;
      }
      //check if user is author
      else if (post.author.clerkId === user.clerkId) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { visible: true },
        });
        return updatedPost;
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
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: { author: true },
      });
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.review !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is not approved",
        });
      }

      //check if user is admin or author
      //check if user is admin
      if (user.role === UserRole.ADMIN) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { visible: false },
        });
        return updatedPost;
      }
      //check if user is author
      else if (post.author.clerkId === user.clerkId) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { visible: false },
        });
        return updatedPost;
      }

      //if not admin or author, throw error
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not admin or author",
      });
    }),

  draftPost: memberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: { author: true },
      });
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.review !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is not approved",
        });
      }

      //check if user is admin or author
      //check if user is admin
      if (user.role === UserRole.ADMIN) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { draft: true },
        });
        return updatedPost;
      }
      //check if user is author
      else if (post.author.clerkId === user.clerkId) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { draft: true },
        });
        return updatedPost;
      }

      //if not admin or author, throw error
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not admin or author",
      });
    }),

  publishPost: memberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: { author: true },
      });
      const user = await ctx.prisma.user.findUnique({
        where: { clerkId: ctx.userId },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      if (post.review !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is not approved",
        });
      }

      //check if user is admin or author
      //check if user is admin
      if (user.role === UserRole.ADMIN) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { draft: false },
        });
        return updatedPost;
      }
      //check if user is author
      else if (post.author.clerkId === user.clerkId) {
        //set visible
        const updatedPost = await ctx.prisma.post.update({
          where: { id: input.id },
          data: { draft: false },
        });
        return updatedPost;
      }

      //if not admin or author, throw error
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not admin or author",
      });
    }),

  approvePost: adminProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), review: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      return await ctx.prisma.post.update({
        where: { id: input.id },
        data: { review: "APPROVED" },
      });
    }),

  rejectPost: adminProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), review: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }
      return await ctx.prisma.post.update({
        where: { id: input.id },
        data: { review: "REJECTED" },
      });
    }),
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
  getOne: memberProcedure
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
        return post;
      } else if (user.role === UserRole.MEMBER) {
        if (post.author.clerkId === ctx.userId) {
          return post;
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You are not authorized to view this post",
          });
        }
      } else {
        if (
          post.visible &&
          post.lowestVisibleRole === UserRole.GUEST &&
          post.review === "APPROVED" &&
          !post.draft
        ) {
          return post;
        }
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to view this post",
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
  createPost: memberProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        lowestVisibleRole: z.nativeEnum(UserRole),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, lowestVisibleRole } = input;
      const post = await ctx.prisma.post.create({
        data: {
          title,
          content,
          lowestVisibleRole,
          author: {
            connect: {
              clerkId: ctx.userId,
            },
          },
        },
      });
      return post;
    }),
  updatePost: memberProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        lowestVisibleRole: z.nativeEnum(UserRole),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, content, lowestVisibleRole } = input;

      // check if user is author or Admin
      const post = await ctx.prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          author: true,
        },
      });
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
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
        const updatedPost = await ctx.prisma.post.update({
          where: {
            id,
          },
          data: {
            title,
            content,
            lowestVisibleRole,
            review: "APPROVED",
            draft: true,
            timesVisited: 0,
            visible: false,
          },
        });
        return updatedPost;
      }

      if (post.author.clerkId !== ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to edit this post",
        });
      }

      const updatedPost = await ctx.prisma.post.update({
        where: {
          id,
        },
        data: {
          title,
          content,
          lowestVisibleRole,
          review: "PENDING",
          draft: true,
          timesVisited: 0,
          visible: false,
        },
      });
      return updatedPost;
    }),
  deletePost: memberProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // check if user is author or Admin
      const post = await ctx.prisma.post.findUnique({
        where: {
          id,
        },
        include: {
          author: true,
        },
      });
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
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
        const deletedPost = await ctx.prisma.post.delete({
          where: {
            id,
          },
        });
        return deletedPost;
      }

      if (post.author.clerkId !== ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this post",
        });
      }

      const deletedPost = await ctx.prisma.post.delete({
        where: {
          id,
        },
      });
      return deletedPost;
    }),
});
