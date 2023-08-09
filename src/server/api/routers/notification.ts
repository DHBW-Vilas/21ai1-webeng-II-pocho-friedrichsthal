import { createTRPCRouter, loggedinProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const notificationRouter = createTRPCRouter({
  getNotifications: loggedinProcedure.query(async ({ ctx }) => {
    const notifications = await ctx.prisma.userNotification.findMany({
      where: {
        userClerkId: ctx.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return notifications;
  }),
  readNotification: loggedinProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.prisma.userNotification.findUnique({
        where: {
          id: input.notificationId,
        },
      });
      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }
      if (notification.userClerkId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        });
      }
      const updatedNotification = await ctx.prisma.userNotification.update({
        where: {
          id: input.notificationId,
        },
        data: {
          read: true,
        },
      });
      return updatedNotification;
    }),
});
