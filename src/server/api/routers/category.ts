import { createTRPCRouter, memberProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
  getAllCategories: memberProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const categories = await ctx.prisma.category.findMany({
        take: limit ?? 20,
        skip: offset ?? 0,
      });
      return categories;
    }),
});
