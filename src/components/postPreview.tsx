import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import { UserNameHover } from "./usernameHover";
import { Button } from "./ui/button";
import Link from "next/link";
import { Tag } from "./tag";

type RouterOutput = inferRouterOutputs<AppRouter>;
type DetailedNews = RouterOutput["post"]["getAllPostsVisibleToUser"][number];

export const PostPreview = (props: {
  post: DetailedNews;
  orientation: "picLeft" | "picRight";
  includeMeta?: boolean;
}) => {
  const { post, orientation, includeMeta } = props;
  const { title, content, createdAt, timesVisited } = post;
  const author = post.author;
  const date = dayjs(createdAt);

  //cut content to 60 words or 600 characters
  let contentCut = content;
  let contentCutFinal = "";
  if (contentCut.split(" ").length > 60) {
    contentCut = contentCut.split(" ").slice(0, 60).join(" ");
    contentCutFinal = contentCut + "...";
  } else if (contentCut.length > 600) {
    contentCut = contentCut.slice(0, 600);
    contentCutFinal = contentCut + "...";
  } else {
    contentCutFinal = contentCut;
  }

  return (
    <div
      className={`flex flex-col md:flex-row md:space-x-4 ${
        orientation === "picLeft" ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="flex w-2/3 flex-col justify-center">
        {includeMeta && (
          <div className="">
            <div className="grid grid-flow-dense grid-cols-8">
              <p className="col-span-2">Visible To:</p>
              <p className="col-span-6">
                <Tag
                  type="role"
                  role={post.visible ? post.lowestVisibleRole : "NOBODY"}
                  message={post.visible ? post.lowestVisibleRole : "NOBODY"}
                />
              </p>
            </div>
            <div className="grid grid-flow-dense grid-cols-8">
              <p className="col-span-2">Status:</p>
              <p className="col-span-6">
                <Tag
                  type="draft"
                  draft={post.draft}
                  message={post.draft ? "draft" : "published"}
                />
              </p>
            </div>
            <div className="grid grid-flow-dense grid-cols-8">
              <p className="col-span-2">Review:</p>
              <p className="col-span-6">
                <Tag type="review" review={post.review} message={post.review} />
              </p>
            </div>
          </div>
        )}

        <div className="flex w-2/3 flex-col justify-center">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500">
            {date.format("DD.MM.YYYY") == dayjs().format("DD.MM.YYYY")
              ? "Today, at " + date.format("HH:mm")
              : date.format("DD.MM.YYYY")}{" "}
            by <UserNameHover displayName={author.displayName} /> |{" "}
            {timesVisited} visits
          </p>
          <p className="text-sm">
            {contentCutFinal}
            <span
              className={
                content.split(" ").length <= 60 || content.length <= 600
                  ? "hidden"
                  : ""
              }
            >
              <Button className="h-auto p-0 pl-2" variant={"link"} asChild>
                <Link href={`/news/${post.id}`}>Read more</Link>
              </Button>
            </span>
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Image
          className="h-auto w-2/3 object-contain"
          src={post.postImageUrl}
          alt="Bild"
          width={600}
          height={600}
        />
      </div>
    </div>
  );
};
