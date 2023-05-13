import { SignIn, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { Instrument } from "@prisma/client";
const RegisterPage: NextPage = () => {
  const { user, isSignedIn } = useUser();
  const userQuery = api.user.getSelf.useQuery();
  const createUserMutation = api.user.createUser.useMutation();
  const router = useRouter();

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
              value={user.lastName || ""}
            />
            <label htmlFor="firstname">Firstname</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={user.firstName || ""}
            />
            <label htmlFor="displayname">Display Name</label>
            <input
              type="text"
              id="displayname"
              name="displayname"
              value={user.username || ""}
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.primaryEmailAddress?.emailAddress || ""}
            />
            <label htmlFor="instruments">Instruments</label>
            <select id="instruments" name="instruments">
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                Object.keys(Instrument).map((key) => {
                  return (
                    <option
                      key={key.toString()}
                      value={key.toString().toLocaleLowerCase()}
                    >
                      {key}
                    </option>
                  );
                })
              }
            </select>
          </form>
        </div>
      );
    } else {
      // if yes, redirect to user page
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push("/user/" + user.id);
    }
  }

  return <div>Register Page</div>;
};

export default RegisterPage;
