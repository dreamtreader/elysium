import { PermissionTypes, Role } from "../../../types"
import PermService from "../../../lib/perms"
import { store } from "../../redux/store"
import { Switch } from "@headlessui/react"

const Permissions = ({
  perms,
  setRolePerms,
}: {
  perms: number
  setRolePerms: (newPerms: number) => any
}) => {
  const permService = new PermService(store.getState())
  const isPermEnabled = (name: string) => {
    return Boolean(
      perms &
        (PermissionTypes.All[name as PermissionTypes.PermissionName] as number),
    )
  }

  return (
    <div className="w-full overflow-y-auto">
      {Object.entries(permService.PermDescriptions).map(
        ([category, permissions]) => (
          <section key={category} className="w-full flex flex-col">
            <h3 className="text-csblue-50 text-sm font-bold">
              {category.toUpperCase()}
            </h3>
            <div className="flex flex-col">
              {Object.entries(permissions).map(([permName, permission]) => (
                <div
                  key={permission.name}
                  className="border-b-[1px] border-csblue-100 py-4 flex flex-col gap-1"
                >
                  <div className="w-full flex justify-between items-center">
                    <h2 className="text-cspink-200 font-bold text-lg">
                      {permission.name}
                    </h2>
                    <Switch
                      className={`${
                        isPermEnabled(permName)
                          ? "bg-cspink-200"
                          : "bg-csblue-400"
                      }
                         relative inline-flex w-16 h-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                      checked={isPermEnabled(permName)}
                      onChange={(checked) =>
                        !checked
                          ? setRolePerms(
                              perms &
                                ~(PermissionTypes.All[
                                  permName as PermissionTypes.PermissionName
                                ] as number),
                            )
                          : setRolePerms(
                              perms |
                                (PermissionTypes.All[
                                  permName as PermissionTypes.PermissionName
                                ] as number),
                            )
                      }
                    >
                      <span
                        className={`absolute transform transition ease-in-out duration-200 h-full aspect-square bg-cspink-50 rounded-full ${
                          isPermEnabled(permName) ? `translate-x-8` : null
                        }
                      `}
                      />
                    </Switch>
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
