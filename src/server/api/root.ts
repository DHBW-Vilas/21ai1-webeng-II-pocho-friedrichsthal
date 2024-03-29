import { createTRPCRouter } from "~/server/api/trpc";
import { eventRouter } from "./routers/events";
import { userRouter } from "./routers/users";
import { musicRouter } from "./routers/music";
import { postRouter } from "./routers/post";
import { categoryRouter } from "./routers/category";
import { groupRouter } from "./routers/groups";
import { generalRouter } from "./routers/general";
import { notificationRouter } from "./routers/notification";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  event: eventRouter,
  user: userRouter,
  music: musicRouter,
  post: postRouter,
  category: categoryRouter,
  group: groupRouter,
  general: generalRouter,
  notifcation: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
