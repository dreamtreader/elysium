import { Menu, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import { partialUser } from "../../types"
import { RootState } from "../redux/store"

import { placements } from "../../lib/UIPlacements"
import { useSelector } from "react-redux"
import Checkbox from "../checkbox"

const MultipleUserSelector = ({
  placement = "down",
  className,
  users,
  onSubmit,
  button,
  buttonClassName,
  title,
}: {
  users: partialUser[]
  placement?: string
  className?: string
  onSubmit?: (userIds: string[]) => any
  button?: JSX.Element
  buttonClassName?: string
  title?: string
}) => {
  const [input, setInput] = useState("")
  const userId = useSelector((state: RootState) => state.user._id)
  const [selected, setSelected] = useState([])

  const usersObject = users.reduce((accumulator, currentUser) => {
    return { ...accumulator, [currentUser._id]: currentUser }
  }, {})

  return (
    <Menu as="div" className={`relative inline-block text-left`}>
      {({ open }) => (
        <>
          <Menu.Button
            onClick={(e) => e.stopPropagation()}
            as={"button"}
            className={`${
              buttonClassName
                ? buttonClassName
                : "rounded-full flex items-center"
            }`}
          >
            {button ? button : <i className="bi bi-plus"></i>}
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
              className={` absolute z-[200] p-4 flex flex-col gap-2 mt-2 w-72 rounded-md bg-csblue-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${placements[placement]} ${className}`}
            >
              <h1 className="font-bold text-lg">
                {title ?? "Insert a title here"}
              </h1>
              <span className="text-csblue-50 text-sm">
                {selected.length}/9 slots taken
              </span>
              <div className="bg-csblue-400 rounded">
                {selected.map((selectedUser) => (
                  <span className="justify-self-start self-start bg-csblue-200 p-1 px-2 rounded-sm">
                    {usersObject[selectedUser].displayName}
                  </span>
                ))}

                <input
                  style={{ backgroundColor: "rgba(205, 92, 92, 0)" }}
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  type="text"
                  className="text-csblue-100 p-1 rounded-md w-full"
                  placeholder="Search.."
                />
              </div>
              <div className="darkest overflow-auto max-h-40 flex flex-col gap-4">
                <ul>
                  {users
                    .filter((user) => {
                      const regExp = new RegExp(input)
                      return (
                        (regExp.test(user.displayName) ||
                          regExp.test(user.username)) &&
                        user._id !== userId
                      )
                    })
                    .map((user: partialUser) => (
                      <Menu.Item>
                        {({ close }) => (
                          <div
                            onClick={(e) => e.preventDefault()}
                            className="w-full p-1 flex items-center justify-between rounded gap-2 hover:bg-csblue-150"
                          >
                            <section className="flex gap-2 items-center">
                              <span
                                {...(user.avatar && {
                                  style: {
                                    backgroundImage: `url(${user.avatar})`,
                                    backgroundPosition: "center",
                                    backgroundSize: "cover",
                                  },
                                })}
                                className="w-6 h-6 rounded-full bg-csblue-400"
                              />
                              <div className="flex gap-1 items-center">
                                <h1 className="text-cspink-50 text-lg font-bold">
                                  {user.displayName}
                                </h1>
                                <h2 className="text-csblue-100 font-bold">
                                  {user.username}
                                </h2>
                              </div>
                            </section>

                            <Checkbox
                              checked={selected.includes(user._id)}
                              onChange={() => {
                                if (!selected.includes(user._id)) {
                                  setSelected([...selected, user._id])
                                } else {
                                  const newSelected = selected.filter(
                                    (selectedUser) => selectedUser !== user._id,
                                  )
                                  setSelected(newSelected)
                                }
                              }}
                            />
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                </ul>
                <button
                  onClick={(e) => onSubmit(selected)}
                  className="w-full p-1 rounded-md bg-cspink-200 hover:bg-cspink-100"
                >
                  Submit
                </button>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default MultipleUserSelector
