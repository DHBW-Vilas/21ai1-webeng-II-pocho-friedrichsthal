import { LoadingPage } from "@/src/components/loading";
import Navbar from "@/src/components/navbar";
import { api } from "@/src/utils/api";
import { type NextPage } from "next";
import Head from "next/head";
import { toast } from "react-hot-toast";
import { PostPreview } from "@/src/components/postPreview";
import Footer from "@/src/components/footer";

const PostPage: NextPage = () => {
  const postQuery = api.post.getAllPostsVisibleToUser.useQuery({});

  if (postQuery.isError) {
    toast.error("Error while fetching posts");
    return <div>Redirecting...</div>;
  }

  if (postQuery.isLoading || !postQuery.data) {
    return <LoadingPage />;
  }

  const news = postQuery.data;
  let postCount = 0;

  //sort posts by date
  news.sort((a, b) => {
    if (a.createdAt > b.createdAt) {
      return -1;
    } else {
      return 1;
    }
  });

  return (
    <>
      <Head>
        <title>News</title>
      </Head>
      <div>
        <Navbar />
        <main className="m-auto sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
          {news.map((post) => {
            postCount++;
            return (
              <PostPreview
                key={post.id}
                post={post}
                orientation={postCount % 2 == 0 ? "picLeft" : "picRight"}
              />
            );
          })}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PostPage;
