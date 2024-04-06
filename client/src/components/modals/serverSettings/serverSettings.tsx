import Modal from "../../Modal"
import { useSelector } from "react-redux"

import { getServerById } from "../../redux/reducers/chatReducer"

import Roles from "./roles"
import Presentation from "./presentation"
import SettingsLayout from "../../settingsLayout"

import { useState, useMemo } from "react"
import { socket } from "../../../socket/socketInitializer"
import { RootState } from "../../redux/store"
import { getOpenModal } from "../../redux/reducers/UIReducer"

const ServerSettings = () => {
  const openModal = useSelector(getOpenModal())

  const server = useSelector(getServerById(openModal?.entity))
  const open = openModal?.type === "serverSettings" && server !== undefined

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const userId = useSelector((state: RootState) => state.user._id)

  const [password, setPassword] = useState("")

  const settings = useMemo(
    () => [
      {
        name: "General",
        children: [
          { name: "Presentation" },
          { name: "Roles" },
          {
            name: "Delete server",
            onClick: () => setDeleteModalOpen(true),
            danger: true,
            condition: server?.ownerId === userId,
          },
        ],
      },
    ],
    [server, userId],
  )

  const components: JSX.Element[] = [
    <Presentation server={server} />,
    <Roles server={server} />,
  ]

  return (
    <>
      <SettingsLayout open={open} list={settings} components={components} />
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(!deleteModalOpen)}
      >
        <div
          autoFocus={true}
          className="bg-csblue-200 flex flex-col gap-4 w-screen max-w-md p-5 rounded-md"
        >
          <h1 className="text-2xl font-bold text-cspink-50">
            Delete {server?.name}
          </h1>
          <p className="text-cspink-50 text-lg">
            Are you sure you want to delete this server?
          </p>
          <form>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-cspink-200 font-bold text-lg"
              >
                PASSWORD
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                className="w-full bg-csblue-400 rounded-md p-2 text-csblue-50"
              />
            </div>
          </form>
          <div className="flex justify-start gap-2">
            <button
              onClick={(e) => setDeleteModalOpen(false)}
              className="p-2 bg-csblue-100 hover:bg-csblue-50 rounded-md  text-cspink-50"
            >
              Cancel
            </button>
            <button
              onClick={(e) =>
                socket.emit("serverRemoved", {
                  _id: server?._id,
                  password: password,
                })
              }
              className="p-2 bg-red-400 hover:bg-red-500 rounded-md font-bold text-cspink-50"
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ServerSettings
