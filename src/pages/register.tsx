import { SignIn, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Instrument } from "@prisma/client";
import { useState } from "react";

const RegisterPage: NextPage = () => {
  const { user, isSignedIn } = useUser();
  const userQuery = api.user.getSelf.useQuery();
  const createUserMutation = api.user.createUser.useMutation();
  const router = useRouter();

  //Form states
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [displayname, setDisplayname] = useState("");
  const [email, setEmail] = useState("");
  const [instrument, setInstrument] = useState("TRUMPET" as Instrument);

  if (!isSignedIn) {
    return (
      <div>
        <SignIn routing="path" path="/userSync" />
      </div>
    );
  }
  if (userQuery.isSuccess) {
    if (!userQuery.data) {
      //display register page with modal for user to fill in details
      return (
        <div>
          <form>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={user.lastName || ""}
              onChange={(e) => setName(e.target.value)}
            />
            <label htmlFor="firstname">Firstname</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              defaultValue={user.firstName || ""}
              onChange={(e) => setFirstname(e.target.value)}
            />
            <label htmlFor="displayname">Display Name</label>
            <input
              type="text"
              id="displayname"
              name="displayname"
              defaultValue={user.username || ""}
              onChange={(e) => setDisplayname(e.target.value)}
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={user.primaryEmailAddress?.emailAddress || ""}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="instruments">Instruments</label>
            <select
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

            <button
              value="Submit"
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
                  primaryInstrument: userObj.primaryInstrument,
                  imageUrl: user.profileImageUrl,
                });
              }}
            >
              Submit
            </button>
          </form>
        </div>
      );
    } else {
      // if yes, redirect to user page
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push("/user/");
    }
  }

  return <div>Register Page</div>;
};

export default RegisterPage;
