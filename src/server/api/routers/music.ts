import { createTRPCRouter, memberProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const musicRouter = createTRPCRouter({
  getAllBooks: memberProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const books = await ctx.prisma.book.findMany({
        take: limit ?? 20,
        skip: offset ?? 0,

        include: {
          musicSheets: true,
        },
      });
      return books;
    }),
  getBookById: memberProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const book = await ctx.prisma.book.findUnique({
        where: {
          id,
        },
        include: {
          musicSheets: true,
        },
      });
      return book;
    }),
  getBookByTitle: memberProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { title } = input;
      const book = await ctx.prisma.book.findUnique({
        where: {
          name: title,
        },
        include: {
          musicSheets: true,
        },
      });
      return book;
    }),

  getMusicSheetById: memberProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const musicSheet = await ctx.prisma.musicSheet.findUnique({
        where: {
          id,
        },
        include: {
          book: true,
        },
      });
      return musicSheet;
    }),
  getMusicSheetsByTitle: memberProcedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { title } = input;
      const musicSheets = await ctx.prisma.musicSheet.findMany({
        where: {
          name: title,
        },
        include: {
          book: true,
        },
      });
      return musicSheets;
    }),
  getIndividualMusicSheets: memberProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset } = input;
      const musicSheets = await ctx.prisma.musicSheet.findMany({
        take: limit ?? 20,
        skip: offset ?? 0,
        where: {
          bookId: null,
        },
      });
      return musicSheets;
    }),
});
