import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const generalRouter = createTRPCRouter({
  getStatistics: adminProcedure.query(async ({ ctx }) => {
    //get user count
    const userCount = await ctx.prisma.user.count();
    //get user count per role
    const userCountPerRole = await ctx.prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });
    //get user count per instrument
    const userCountPerInstrument = await ctx.prisma.user.groupBy({
      by: ["primaryInstrument"],
      _count: {
        primaryInstrument: true,
      },
    });
    //get event count
    const eventCount = await ctx.prisma.event.count();

    //get post count
    const postCount = await ctx.prisma.post.count();

    //get group count
    const groupCount = await ctx.prisma.userGroup.count();

    return {
      userCount,
      userCountPerRole,
      userCountPerInstrument,
      eventCount,
      postCount,
      groupCount,
    };
  }),
});
