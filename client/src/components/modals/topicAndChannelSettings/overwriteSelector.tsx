import { Menu, Transition } from "@headlessui/react"
import Tooltip from "../../tooltip"
import { Fragment, useState } from "react"
import { Member, Role } from "../../../types"
import PermService from "../../../lib/perms"
import { RootState, store } from "../../redux/store"
import { useSelector } from "react-redux"

const placements: { [index: string]: string } = {
  left: "top-[50%] translate-y-[-50%] right-[100%]",
  right: "top-[50%] translate-y-[-50%] left-[100%]",
  up: "left-[50%] translate-x-[-50%] bottom-[100%]",
  down: "left-[50%] translate-x-[-50%] top-[100%]",
}

const Selector = ({
  placement = "down",
  className,
  roles,
  members,
  onSelect,
}: {
  roles: { [id: string]: Role }
  members: { [id: string]: Member }
  placement?: string
  className?: string
  onSelect?: (_id: string, type: 0 | 1) => any
}) => {
  const [input, setInput] = useState("")
  const perms = new PermService(store.getState())

  return (
    <Menu as="div" className={`relative inline-block text-left`}>
      {({ open }) => (
        <>
          <Menu.Button>
            <Tooltip text="Add overwrite">
              <button className="text-2xl text-cspink-50 flex justify-center items-center">
                <i className="bi bi-plus-lg"></i>
              </button>
            </Tooltip>
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
                  {Object.values(roles)
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
                        perms.isHigher(role._id, role.serverId)
                      )
                    })
                    .map((role) => (
                      <li
                        onClick={(e) => onSelect(role._id, 0)}
                        className="w-full p-1 flex items-center rounded cursor-pointer gap-2 hover:bg-csblue-300"
                      >
                        <span
                          style={{ backgroundColor: role.color }}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-csblue-50">{role.name}</span>
                      </li>
                    ))}
                </ul>
                <h1 className="font-bold text-csblue-100">MEMBERS</h1>
                <ul>
                  {Object.values(members)
                    .filter((member) => {
                      const regExp = new RegExp(input)

                      return (
                        (regExp.test(member.username) ||
                          regExp.test(member.displayName)) &&
                        perms.canManage(
                          "MANAGE_CHANNEL",
                          member._id,
                          member.serverId,
                        )
                      )
                    })
                    .map((member) => (
                      <li
                        onClick={(e) => onSelect(member._id, 1)}
                        className="w-full p-1 flex items-center rounded cursor-pointer gap-2 hover:bg-csblue-300"
                      >
                        <span
                          style={{
                            backgroundImage: `url(${member.avatar})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }}
                          className="bg-csblue-200 w-4 h-4 rounded-full"
                        />
                        <span className="text-csblue-50">
                          {member.username}
                        </span>
                      </li>
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

export default Selector
