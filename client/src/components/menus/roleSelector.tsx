import { Menu, Transition } from "@headlessui/react"
import Tooltip from "../tooltip"
import { Fragment, useState } from "react"
import { Role } from "../../types"
import PermService from "../../lib/perms"
import { store } from "../redux/store"
import { sortByPosition } from "../../lib/sortFunctions"

import { placements } from "../../lib/UIPlacements"

const RoleSelector = ({
  placement = "down",
  className,
  roles,
  onSelect,
  children,
}: {
  roles: Role[]
  placement?: string
  className?: string
  onSelect?: (_id: string) => any
  children: React.ReactNode
}) => {
  const [input, setInput] = useState("")
  const perms = new PermService(store.getState())

  return (
    <Menu as="div" className={`relative inline-block text-left`}>
      {({ open }) => (
        <>
          <Menu.Button
            onClick={(e) => e.stopPropagation()}
            as={"button"}
            className="rounded-full flex items-center bg-cspink-50/[0.2]"
          >
            <i className="bi bi-plus"></i>
          </Menu.Button>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              onClick={(e) => e.stopPropagation()}
              className={` absolute z-[200] p-2 flex flex-col gap-2 mt-2 w-56 rounded-md bg-csblue-500 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${placements[placement]} ${className}`}
            >
              <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                type="text"
                className="text-csblue-100 rounded w-full p-1 bg-csblue-200"
                placeholder="Search.."
              />
              <div className=" darkest overflow-auto max-h-40">
                <h1 className="font-bold text-csblue-100">ROLES</h1>
                <ul>
                  {roles
                    .filter((role) => {
                      const regExp = new RegExp(input)
                      const selfMember = Object.values(
                        store.getState().members,
                      ).find(
                        (member) =>
                          member.serverId === member.serverId &&
                          member.userId === store.getState().user._id,
                      )
                      return (
                        regExp.test(role.name) &&
                        perms.isHigher(role._id, role.serverId) &&
                        role.position !== 0
                      )
                    })
                    .sort(sortByPosition)
                    .map((role) => (
                      <Menu.Item>
                        {({ close }) => (
                          <button
                            onClick={(e) => {
                              onSelect(role._id)
                              close()
                            }}
                            className="w-full p-1 flex items-center rounded cursor-pointer gap-2 hover:bg-csblue-300"
                          >
                            <span
                              style={{ backgroundColor: role.color }}
                              className="w-4 h-4 rounded-full"
                            />
                            <span className="text-csblue-50">{role.name}</span>
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                </ul>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default RoleSelector
