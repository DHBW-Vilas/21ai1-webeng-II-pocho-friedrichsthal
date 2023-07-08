/* eslint-disable react/no-children-prop */
import Footer from "@/src/components/footer";
import { LoadingPage } from "@/src/components/loading";
import Navbar from "@/src/components/navbar";
import { UserNameHover } from "@/src/components/usernameHover";
import { api } from "@/src/utils/api";
import dayjs from "dayjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

const DetailedNewsPage: NextPage = () => {
  const router = useRouter();
  const { newsId } = router.query;

  const increaseVisitCountMutation =
    api.post.increasePostViewCount.useMutation();

  const postQuery = api.post.getOneVisible.useQuery({
    id: newsId as string,
  });

  const [visited, setVisited] = useState(false);

  if (!visited) {
    increaseVisitCountMutation.mutate({ postId: newsId as string });
    setVisited(true);
  }

  if (postQuery.isError) {
    toast.error("Error while fetching post");
  }

  if (postQuery.isLoading || !postQuery.data) {
    return <LoadingPage />;
  }

  const post = postQuery.data;
  const { author, timesVisited } = post;
  const date = dayjs(post.createdAt);

  return (
    <>
      <Navbar />
      <main>
        <div className="m-auto w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
          <div>
            <div className="flex">
              <div>
                <h1 className="text-7xl font-bold text-slate-600">
                  {post.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {date.format("DD.MM.YYYY") == dayjs().format("DD.MM.YYYY")
                    ? "Today, at " + date.format("HH:mm")
                    : date.format("DD.MM.YYYY")}{" "}
                  by <UserNameHover displayName={author.displayName} /> |{" "}
                  {timesVisited} visits
                </p>
              </div>
            </div>
            <Image
              className="float-left h-96 w-96 "
              src={post.postImageUrl}
              width={500}
              height={500}
              alt=""
            />
            {post.content}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DetailedNewsPage;
