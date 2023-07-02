import { createTRPCRouter, loggedinProcedure } from "~/server/api/trpc";

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
});
