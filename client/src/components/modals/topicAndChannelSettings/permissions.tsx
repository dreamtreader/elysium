import { Overwrite, PermissionTypes, Role } from "../../../types"
import PermService from "../../../lib/perms"
import { store } from "../../redux/store"
import { Switch } from "@headlessui/react"
import OverwriteSwitch from "./overwriteSwitch"

const Permissions = ({
  overwrite,
  setPerms,
}: {
  overwrite: Overwrite
  setPerms: ({ allow, deny }: { allow: number; deny: number }) => any
}) => {
  const permService = new PermService(store.getState())

  const isAllowed = (permName: string) =>
    Boolean(
      overwrite.allow &
        (PermissionTypes.All[
          permName as PermissionTypes.PermissionName
        ] as number),
    )

  const isDenied = (permName: string) =>
    Boolean(
      overwrite.deny &
        (PermissionTypes.All[
          permName as PermissionTypes.PermissionName
        ] as number),
    )

  return (
    <div className="w-full overflow-y-auto">
      {Object.entries(permService.PermDescriptions).map(
        ([category, permissions]) => (
          <section key={category} className="w-full flex flex-col">
            <h3 className="text-csblue-50 text-sm font-bold">
              {category.toUpperCase()}
            </h3>
            <div className="flex flex-col">
              {Object.entries(permissions)
                .filter(
                  ([permName, permission]) =>
                    PermissionTypes.canAddOverwrite[permName] !== undefined,
                )
                .map(([permName, permission]) => (
                  <div
                    key={permission.name}
                    className="border-b-[1px] border-csblue-100 py-4 flex flex-col gap-1"
                  >
                    <div className="w-full flex justify-between items-center">
                      <h2 className="text-cspink-200 font-bold text-lg">
                        {permission.name}
                      </h2>
                      <OverwriteSwitch
                        permName={permName}
                        setPerms={setPerms}
                        overwrite={overwrite}
                        state={
                          isAllowed(permName)
                            ? "allowed"
                            : isDenied(permName)
                            ? "denied"
                            : "neutral"
                        }
                      />
                    </div>
                    <p className="text-cspink-50">{permission.description}</p>
                  </div>
                ))}
            </div>
          </section>
        ),
      )}
    </div>
  )
}

export default Permissions
