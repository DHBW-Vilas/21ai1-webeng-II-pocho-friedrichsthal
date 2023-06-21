import { UserRole } from "@prisma/client";

export const Tag = ({ ...props }) => {
  let bgCol = "bg-grey-500";
  if (props.type === "role") {
    if (props.role === UserRole.GUEST) {
      bgCol = "bg-slate-500";
    } else if (props.role === UserRole.MEMBER) {
      bgCol = "bg-slate-600";
    } else if (props.role === UserRole.ADMIN) {
      bgCol = "bg-slate-700";
    }
  }

  const message = props.message as string;

  return (
    <span
      className={
        "mb-2 mr-2 inline-block rounded-md px-3 py-1 text-sm font-semibold text-slate-100 " +
        bgCol
      }
    >
      {message.replace(/(\w)(\w*)/g, function (g0, g1: string, g2: string) {
        return g1.toUpperCase() + g2.toLowerCase();
      })}
    </span>
  );
};
