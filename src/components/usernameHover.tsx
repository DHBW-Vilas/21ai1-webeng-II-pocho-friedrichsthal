import { toast } from "react-hot-toast";
import { api } from "../utils/api";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserCardDetails } from "./cards";

export const UserNameHover = ({ ...props }) => {
  const displayName = props.displayName as string;

  const userQuery = api.user.getOneByDisplayName.useQuery({ displayName });

  if (userQuery.isLoading) {
    return <span>{displayName}</span>;
  }
  if (userQuery.isError) {
    toast.error(userQuery.error.message);
    return <span>{displayName}</span>;
  }
  if (!userQuery.data) {
    return <span>{displayName}</span>;
  }

  const user = userQuery.data;
  return (
    <HoverCard>
      <HoverCardTrigger className="m-0 h-auto p-0" asChild>
        <Button variant="link" className="text-accent">
          @{displayName}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="relative flex h-auto w-auto  justify-around gap-6 p-2 align-middle">
        <div
          className={
            user.imageUrl ? "flex justify-between space-x-4" : "space-x-4"
          }
        >
          {user.imageUrl && (
            <Avatar>
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
          )}

          <div className="space-y-1">
            <UserCardDetails {...user} />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
