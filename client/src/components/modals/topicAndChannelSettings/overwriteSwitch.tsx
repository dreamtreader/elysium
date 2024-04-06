import { Overwrite, PermissionTypes } from "../../../types"

const OverwriteSwitch = ({
  state,
  permName,
  overwrite,
  setPerms,
}: {
  state: "allowed" | "denied" | "neutral"
  permName: string
  overwrite: Overwrite
  setPerms: ({ allow, deny }: { allow: number; deny: number }) => any
}) => {
  return (
    <button
      onClick={(e) => {
        if (state == "allowed")
          setPerms({
            allow:
              overwrite.allow &
              ~(PermissionTypes.All[
                permName as PermissionTypes.PermissionName
              ] as number),
            deny:
              overwrite.deny |
              (PermissionTypes.All[
                permName as PermissionTypes.PermissionName
              ] as number),
          })
        else if (state == "neutral")
          setPerms({
            allow:
              overwrite.allow |
              (PermissionTypes.All[
                permName as PermissionTypes.PermissionName
              ] as number),
            deny:
              overwrite.deny &
              ~(PermissionTypes.All[
                permName as PermissionTypes.PermissionName
              ] as number),
          })
        else
          setPerms({
            allow:
              overwrite.allow &
              ~(PermissionTypes.All[
                permName as PermissionTypes.PermissionName
              ] as number),
            deny:
              overwrite.deny &
              ~(PermissionTypes.All[
                permName as PermissionTypes.PermissionName
              ] as number),
          })
      }}
      className={`${
        state == "allowed"
          ? "bg-green-400"
          : state == "neutral"
          ? "bg-csblue-400"
          : "bg-red-400"
      }
                         relative inline-flex w-16 h-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
    >
      <span
        className={`absolute transform transition ease-in-out duration-200 h-full aspect-square bg-cspink-50 rounded-full ${
          state == "allowed"
            ? `translate-x-8`
            : state == "neutral"
            ? `translate-x-4`
            : null
        }
                      `}
      />
    </button>
  )
}

export default OverwriteSwitch
