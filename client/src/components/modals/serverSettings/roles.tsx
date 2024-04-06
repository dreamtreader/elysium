import {
  isActive,
  componentClosed,
  saveChangesOpened,
} from "../../redux/reducers/UIReducer"

import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { Member, Role, Server } from "../../../types"
import SaveChanges from "../saveChangesNew"
import { getServerRoles } from "../../redux/reducers/roleReducer"
import { Switch, Tab } from "@headlessui/react"
import Tooltip from "../../tooltip"
import Permissions from "./permissions"
import { socket } from "../../../socket/socketInitializer"
import PermService from "../../../lib/perms"
import { getSelfAsMember } from "../../redux/reducers/memberReducer"
import { store } from "../../redux/store"

const RoleSection = ({
  role,
  editRole,
  deleteRole,
  editPerms,
  locked,
}: {
  role: Role
  editRole: (id: string, field: string, value: any) => any
  deleteRole: (id: string) => any
  editPerms: (permNumber: number) => any
  locked: boolean
}) => {
  return (
    <div className="w-full min-h-screen overflow-y-auto pt-[60px] p-4">
      <Tab.Group>
        <Tab.List className="w-full flex gap-2 border-csblue-300 border-b-2">
          <Tab
            className={({ selected }) =>
              `w-full p-4 font-bold text-csblue-50 ${
                selected
                  ? "font-bold text-cspink-50 border-cspink-200 border-b-2"
                  : null
              }`
            }
          >
            Display
          </Tab>
          <Tab
            disabled={locked}
            className={({ selected }) =>
              `w-full p-4 font-bold text-csblue-50 ${
                selected
                  ? "font-bold text-cspink-50 border-cspink-200 border-b-2"
                  : null
              }`
            }
          >
            Permissions
          </Tab>
        </Tab.List>
        <Tab.Panels className="py-4 overflow-auto">
          <Tab.Panel>
            <h1 className="mb-1 font-bold text-csblue-50 mb-1">NAME & COLOR</h1>
            <div className="w-full h-[80px] flex rounded-2xl bg-csblue-300 p-4 gap-4 items-stretch">
              <div className="w-full flex gap-2 items-center">
                <h2 className="text-cspink-100 font-bold text-lg">NAME</h2>
                <input
                  className={`w-full bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                    role.position === 0 || locked ? "bg-slate-400" : null
                  }`}
                  type="text"
                  onChange={(e) => editRole(role._id, "name", e.target.value)}
                  maxLength={100}
                  disabled={locked || role.position === 0}
                  value={role.name}
                  placeholder="Type in a new name.."
                />
              </div>
              <input
                type="color"
                onChange={(e) => editRole(role._id, "color", e.target.value)}
                value={role.color}
                style={{
                  backgroundColor: role.color,
                }}
                className="h-full aspect-square rounded-2xl inline-flex"
              />
            </div>
            <div className="w-full h-[1px] bg-csblue-150 my-6" />
            <section>
              <div className="w-full flex justify-between items-center">
                <h1 className="font-bold text-csblue-50 mb-1">HOISTED</h1>
                <Switch
                  onChange={(e) => editRole(role._id, "hoisted", !role.hoisted)}
                  checked={role.hoisted ?? false}
                  className={`${
                    role.hoisted ? "bg-cspink-200" : "bg-csblue-400"
                  }
                         relative inline-flex w-16 h-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                >
                  <span
                    className={`absolute transform transition ease-in-out duration-200 h-full aspect-square bg-cspink-50 rounded-full ${
                      role.hoisted ? `translate-x-8` : null
                    }
                      `}
                  />
                </Switch>
              </div>
              <p className="text-cspink-50">
                When holding multiple roles with individual display, the highest
                one will be shown.
              </p>
            </section>
            <div className="w-full h-[1px] bg-csblue-150 my-6" />
            <section>
              <div className="w-full flex justify-between items-center">
                <h1 className="font-bold text-csblue-50 mb-1">MENTIONABLE</h1>
                <Switch
                  onChange={(e) =>
                    editRole(role._id, "mentionable", !role.mentionable)
                  }
                  checked={role.mentionable ?? false}
                  className={`${
                    role.mentionable ? "bg-cspink-200" : "bg-csblue-400"
                  }
                         relative inline-flex w-16 h-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                >
                  <span
                    className={`absolute transform transition ease-in-out duration-200 h-full aspect-square bg-cspink-50 rounded-full ${
                      role.mentionable ? `translate-x-8` : null
                    }
                      `}
                  />
                </Switch>
              </div>
              <p className="text-cspink-50">
                Allowing a role to be mentioned will mean all members within
                this role can be pinged, use with caution.
              </p>
            </section>
            <div className="w-full h-[1px] bg-csblue-150 my-6" />
            <section>
              <h1 className="font-bold text-csblue-50 mb-1">DELETE</h1>
              <p className="leading-5 text-cspink-50">
                Deleting this role will remove it from all members, potentially
                altering their permissions. Use with caution.
              </p>
              {!locked && role.position !== 0 ? (
                <button
                  onClick={(e) => {
                    {
                      socket.emit("roleRemoved", {
                        roleId: role._id,
                        serverId: role.serverId,
                      })
                      deleteRole(role._id)
                    }
                  }}
                  className="mt-4 p-2 text-red-400 hover:text-cspink-50 rounded border-red-500 border-2 hover:bg-red-500 self-start"
                >
                  Delete
                </button>
              ) : null}
            </section>
          </Tab.Panel>
          <Tab.Panel>
            {locked ? (
              <h1>
                You are not allowed to view or change this role's permissions
              </h1>
            ) : (
              <Permissions perms={role.permissions} setRolePerms={editPerms} />
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

const Roles = ({ server }: { server: Server }) => {
  const dispatch = useDispatch()
  const saveChangesOpen: boolean = useSelector(isActive(true, "saveChanges"))
  const rolesSelector = useSelector(getServerRoles(server?._id))

  const member = useSelector(getSelfAsMember(server?._id))

  const roles = rolesSelector.reduce((a: any, v: Role) => {
    return {
      ...a,
      [v._id]: v,
    }
  }, {})
  const [activeId, setActiveId] = useState("")

  const [editedRoleIds, setEditedRoleIds] = useState<{ [id: string]: true }>({})
  const [formState, setFormState] = useState<{ [key: string]: Role }>(roles)
  const perms = new PermService(store.getState())

  const filterByPosition = (a: Role, b: Role) =>
    a.position > b.position ? -1 : 1

  const areNotEqual = (editedRole: Role, initialRole: Role) =>
    ["position", "permissions", "color", "hoisted", "mentionable"].reduce(
      (accumulatedValue: boolean, field: string) =>
        editedRole[field as keyof Role] !== initialRole[field as keyof Role] ||
        accumulatedValue,
      editedRole.name !== initialRole.name,
    )

  const inequalityCondition = (editedRole?: Role, initialRole?: Role) =>
    editedRole && initialRole
      ? areNotEqual(editedRole, initialRole) ||
        Object.keys(editedRoleIds).length
      : Object.keys(editedRoleIds).length

  useEffect(() => {
    setFormState({ ...roles, ...formState })
  }, [rolesSelector.length])

  useEffect(() => {
    const editedRole = formState[activeId]
    const initialRole = roles[activeId]

    if (inequalityCondition(editedRole, initialRole)) {
      if (!saveChangesOpen) dispatch(saveChangesOpened(true))
    } else if (saveChangesOpen) {
      dispatch(componentClosed("saveChanges"))
    }
  }, [formState])

  const deleteRole = (id: string) => {
    const newFormState = formState
    delete newFormState[id]
    setFormState(newFormState)
  }

  const editRole = (id: string, field: string, value: any) => {
    const editedRole = { ...formState[activeId], [field]: value }

    const initialRole = roles[activeId]

    if (!editedRoleIds[activeId] && areNotEqual(editedRole, initialRole))
      setEditedRoleIds({ ...editedRoleIds, [activeId]: true })
    else if (editedRoleIds[activeId] && !areNotEqual(editedRole, initialRole)) {
      const newEditedRoleIds = editedRoleIds
      delete newEditedRoleIds[activeId]
      setEditedRoleIds(newEditedRoleIds)
    }

    setFormState({
      ...formState,
      [id]: editedRole,
    })
  }
  const editPerms = (newPerms: number) => {
    console.log(newPerms)
    editRole(activeId, "permissions", newPerms)
  }

  const checkRoleAccess = (role: Role) =>
    perms.getHighestRole(member, server?._id)?.position < role.position &&
    member.userId !== server.ownerId

  return (
    <div className="max-w-[740px] min-h-[460px] grow shrink flex h-full">
      <div className="min-w-[100%] grid grid-cols-[218px,_1fr]">
        <ul className="border-r-[1px] border-csblue-400 flex flex-col gap-1  p-4 pt-20">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-cspink-50 font-bold text-xl">Roles</h1>
            <Tooltip text="Create role">
              <button
                onClick={(e) =>
                  socket.emit("roleAdded", { serverId: server?._id })
                }
                className="text-2xl text-cspink-50 flex justify-center items-center"
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </Tooltip>
          </div>
          {(Object.values(formState) as Role[])
            .sort(filterByPosition)
            .map((role: Role) => (
              <button
                key={role._id}
                onClick={(e) => setActiveId(role._id)}
                className={` p-2 flex items-center gap-2 px-4 w-full text-cspink-50 rounded-md text-start ${
                  role._id !== activeId
                    ? ` hover:bg-csblue-150`
                    : `bg-csblue-100`
                }`}
              >
                <span
                  style={{ backgroundColor: role.color }}
                  className="w-4 aspect-square rounded-full inline-block"
                />
                {role ? (
                  checkRoleAccess(role) ? (
                    <i className="bi bi-lock-fill"></i>
                  ) : null
                ) : null}
                {role.name?.length ? role.name : "..."}
              </button>
            ))}
        </ul>
        {formState[activeId] ? (
          <RoleSection
            role={formState[activeId]}
            editPerms={editPerms}
            editRole={editRole}
            deleteRole={deleteRole}
            locked={checkRoleAccess(formState[activeId])}
          />
        ) : null}
      </div>
      <SaveChanges
        onSave={() => {
          Object.keys(editedRoleIds).forEach((roleId) => {
            const editedRole = formState[roleId]
            console.log(editedRole)
            socket.emit("roleChanged", { ...editedRole, roleId: roleId })
          })
        }}
        onReset={() => {
          setFormState(roles)
          setEditedRoleIds({})
        }}
      />
    </div>
  )
}

export default Roles
