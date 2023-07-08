import { SignIn, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Instrument } from "@prisma/client";
import { useState } from "react";
import { LoadingPage } from "../components/loading";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

const RegisterPage: NextPage = () => {
  const { user, isSignedIn } = useUser();
  const userQuery = api.user.isRegisterdCheck.useQuery();
  const createUserMutation = api.user.createUser.useMutation();
  const router = useRouter();

  //Form states
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [displayname, setDisplayname] = useState("");
  const [email, setEmail] = useState("");
  const [instrument, setInstrument] = useState("TRUMPET" as Instrument);

  const path = router.query.path as string;

  if (userQuery.isError) {
    console.log(userQuery.error);
    return <div>Something went wrong</div>;
  }

  if (userQuery.isLoading) {
    return <LoadingPage />;
  }

  if (!isSignedIn) {
    return (
      <div>
        <SignIn routing="path" path="/userSync?path='/'" />
      </div>
    );
  }
  if (userQuery.isSuccess) {
    if (userQuery.data == false) {
      if (displayname == "" && user.username != null) {
        setDisplayname(user.username);
      } else if (displayname == "" && user.firstName != null) {
        setDisplayname(user.firstName);
      }

      //display register page with modal for user to fill in details
      return (
        <div className="my-auto flex h-screen items-center justify-center bg-primary">
          <div className=" w-full max-w-screen-sm  rounded-lg border-2 border-slate-700 bg-slate-100 p-4">
            <h1 className="text-center">Register</h1>
            <p className="text-center">
              Please fill in the following details to complete your registration
            </p>

            <form className="flex w-full flex-col justify-center">
              <div className="flex flex-row justify-between">
                <div className="w-1/3">
                  <Label htmlFor="firstname">Firstname</Label>
                  <Input
                    type="text"
                    id="firstname"
                    name="firstname"
                    defaultValue={user.firstName || ""}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                </div>
                <div className="w-1/3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={user.lastName || ""}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="displayname">Display Name</Label>
                <Input
                  type="text"
                  id="displayname"
                  name="displayname"
                  defaultValue={user.username || ""}
                  onChange={(e) => setDisplayname(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={user.primaryEmailAddress?.emailAddress || ""}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instruments">Instruments</Label>
                <br />
                <select
                  className="w-full p-2 text-center"
                  id="instruments"
                  name="instruments"
                  onChange={(e) => setInstrument(e.target.value as Instrument)}
                >
                  {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    Object.keys(Instrument).map((key) => {
                      return (
                        <option key={key.toString()} value={key.toString()}>
                          {key}
                        </option>
                      );
                    })
                  }
                </select>
              </div>
              <Button
                value="Submit"
                className="mt-4"
                onClick={() => {
                  const userObj = {
                    name: name,
                    firstname: firstname,
                    displayname: displayname,
                    email: email,
                    primaryInstrument: instrument as Instrument,
                    imageUrl: user.profileImageUrl,
                  };

                  console.log("Creating user");
                  createUserMutation.mutate({
                    displayName: userObj.displayname,
                    firstName: userObj.firstname,
                    lastName: userObj.name,
                    email: userObj.email,
                    imageUrl: user.profileImageUrl,
                    primaryInstrument: userObj.primaryInstrument,
                  });
                }}
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      );
    } else {
      // if yes, redirect to user page
      void router.push(path);
    }
  }

  return <div>Register Page</div>;
};

export default RegisterPage;
