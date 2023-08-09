import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { api } from "@/src/utils/api";
import { UserRole } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingPage } from "@/src/components/loading";
import Head from "next/head";
import Navbar from "@/src/components/navbar";
import Footer from "@/src/components/footer";

const CreateNewsForm = () => {
  const getSelf = api.user.getSelf.useQuery();
  const [post, setPost] = useState({
    title: "",
    content: "",
    lowestVisibleRole: UserRole.GUEST as UserRole,
  });
  const createPostMutation = api.post.createPost.useMutation();

  if (getSelf.isError) {
    toast.error("Something went wrong");
  }
  if (getSelf.isLoading || !getSelf.data) {
    return <LoadingPage />;
  }

  const user = getSelf.data;

  return (
    <div>
      <form className="h-full">
        <div className="flex justify-between">
          <div className="w-2/5">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              className="w-full"
              name="title"
              required
              defaultValue={post.title}
              onChange={(e) => {
                setPost({ ...post, title: e.target.value });
              }}
            />
          </div>
          <div className="w-2/5">
            <Label htmlFor="lowestVisibleRole">Lowest Visible Role</Label>
            <Select
              onValueChange={(e) => {
                setPost({ ...post, lowestVisibleRole: e as UserRole });
              }}
              defaultValue={post.lowestVisibleRole}
            >
              <SelectTrigger placeholder="Test">
                <SelectValue
                  className="w-full"
                  placeholder="Test"
                  defaultValue={post.lowestVisibleRole}
                />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(UserRole).map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    disabled={
                      (user.role === UserRole.GUEST &&
                        role !== UserRole.GUEST) ||
                      (user.role === UserRole.MEMBER && role === UserRole.ADMIN)
                    }
                    defaultChecked={role === user.role}
                  >
                    {role.replace(
                      /(\w)(\w*)/g,
                      function (g0, g1: string, g2: string) {
                        return g1.toUpperCase() + g2.toLowerCase();
                      }
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Label htmlFor="content">Content</Label>
        <Textarea
          className="h-auto"
          id="content"
          name="content"
          defaultValue={post.content}
          onChange={(e) => {
            setPost({ ...post, content: e.target.value });
          }}
        />

        <Button
          className="mt-4 w-full"
          disabled={!post.title || !post.content}
          onClick={() => {
            createPostMutation.mutate(post);
          }}
        >
          Save
        </Button>
      </form>
    </div>
  );
};

const CreateNews = () => {
  const getSelf = api.user.getSelf.useQuery();

  if (getSelf.isError) {
    toast.error("Something went wrong");
  }
  if (getSelf.isLoading || !getSelf.data) {
    return <LoadingPage />;
  }

  if (getSelf.data.role === UserRole.GUEST) {
    toast.error("You are not allowed to do this");
    return <LoadingPage />;
  }

  return (
    <>
      <Head>
        <title>Create News</title>
      </Head>
      <main>
        <Navbar />
        <div className="flex w-full justify-center">
          <main className="w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
            <CreateNewsForm />
          </main>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default CreateNews;
