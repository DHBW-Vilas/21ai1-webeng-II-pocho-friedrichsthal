import { useState } from "react";
import { api } from "../utils/api";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "../utils/api";

type RouterOutput = inferRouterOutputs<AppRouter>;
type DetailedGroup = RouterOutput["group"]["getAllGroups"][number];

export const UpdateGroupForm = (props: {
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setGroup: React.Dispatch<React.SetStateAction<DetailedGroup>>;
  group: DetailedGroup;
}) => {
  const [groupName, setGroupName] = useState(props.group.name);
  const [groupDescription, setGroupDescription] = useState(
    props.group.description || ""
  );

  const updateGroup = api.group.updateGroup.useMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateGroup.mutate({
      groupId: props.group.id,
      name: groupName,
      description: groupDescription,
    });
    props.setGroup({
      ...props.group,
      name: groupName,
      description: groupDescription,
    });
    props.setDialogOpen(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="groupName">Group Name</Label>
        <Input
          required
          id="groupName"
          type="text"
          value={groupName}
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        />
      </div>
      <div>
        <Label htmlFor="groupDescription">Group Description</Label>
        <Input
          id="groupDescription"
          type="text"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
        />
      </div>
      <Button className="mt-4 w-full" type="submit">
        Update Group
      </Button>
    </form>
  );
};

export const CreateGroupForm = (props: {
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const createGroup = api.group.createGroup.useMutation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createGroup.mutate({ name: groupName, description: groupDescription });
    props.setDialogOpen(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="groupName">Group Name</Label>
        <Input
          required
          id="groupName"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="groupDescription">Group Description</Label>
        <Input
          id="groupDescription"
          type="text"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
        />
      </div>
      <Button className="mt-4 w-full" type="submit">
        Create Group
      </Button>
    </form>
  );
};

export default CreateGroupForm;
