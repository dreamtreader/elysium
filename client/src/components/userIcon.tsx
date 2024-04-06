import { fullMember, partialUser } from "../types"

const UserIcon = ({
  user,
  className,
}: {
  user: partialUser | fullMember
  className?: string
}) => {
  return (
    <span
      style={{
        backgroundImage: `url(${user.avatar})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
      className={`relative inline-block icon aspect-square ${className}`}
    >
      {user.isOnline ? (
        <span className="inline-block z-200 absolute left-[70%] bottom-[-10%] border-csblue-200 border-2 w-[40%] h-[40%] max-w-[1.2rem] max-h-[1.2rem] bg-green-400 rounded-full" />
      ) : null}
    </span>
  )
}

export default UserIcon
