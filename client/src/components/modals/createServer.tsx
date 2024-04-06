import { Transition } from "@headlessui/react"

import { useSelector } from "react-redux"
import { useState } from "react"

import { isActive } from "../redux/reducers/UIReducer"
import ModalComp from "../Modal"
import { socket } from "../../socket/socketInitializer"

const JoinServer = ({ onReturn }: { onReturn?: () => void }) => {
  const [inviteId, setInviteId] = useState("")
  const onSubmit = () => {
    socket.emit("serverJoined", { inviteId: inviteId })
  }
  return (
    <div className="w-full  bg-csblue-200 flex flex-col gap-4 w-full max-w-md p-5 rounded-md">
      <button
        onClick={(e) => onReturn?.()}
        className="fixed text-2xl text-csblue-50 hover:text-cspink-50 font-bold"
      >
        <i className="bi bi-arrow-left-circle"></i>
      </button>
      <h1 className="text-center text-2xl font-bold text-cspink-50">
        Join a server
      </h1>
      <form className="flex flex-col gap-1">
        <label htmlFor="name" className="text-cspink-200 font-bold text-lg">
          Invite ID
        </label>

        <input
          type="text"
          maxLength={100}
          value={inviteId}
          onChange={(e) => setInviteId(e.target.value)}
          placeholder="Type in your invite ID.."
          name="ID"
          minLength={5}
          className="bg-csblue-400 rounded-md p-2 text-cspink-200"
        />
      </form>
      <button
        onClick={(e) => onSubmit()}
        className="w-full p-2 bg-cspink-200 hover:bg-cspink-100 rounded-md text-xl font-bold text-cspink-50"
      >
        Submit
      </button>
    </div>
  )
}

const CreateServer = ({ onReturn }: { onReturn?: () => void }) => {
  const [formState, setFormState] = useState<{
    name: string
    avatar?: string
  }>({
    name: "",
    avatar: "",
  })

  const onSubmit = () => {
    formState.avatar === "" ? delete formState.avatar : null
    socket.emit("serverAdded", formState)
  }

  return (
    <div className="w-full bg-csblue-200 flex flex-col gap-4 w-full max-w-md p-5 rounded-md">
      <button
        onClick={(e) => onReturn?.()}
        className="fixed text-2xl text-csblue-50 hover:text-cspink-50 font-bold"
      >
        <i className="bi bi-arrow-left-circle"></i>
      </button>
      <h1 className="text-center text-2xl font-bold text-cspink-50">
        Create a new server
      </h1>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-cspink-200 font-bold text-lg">
            NAME
          </label>

          <input
            type="text"
            value={formState.name}
            onChange={(e) =>
              setFormState({
                ...formState,
                name: e.target.value,
              })
            }
            minLength={2}
            maxLength={100}
            name="name"
            className="bg-csblue-400 rounded-md p-2 text-cspink-200"
          />
        </div>
      </form>
      <button
        onSubmit={(e) => onSubmit()}
        className="w-full p-2 bg-cspink-200 hover:bg-cspink-100 rounded-md text-xl font-bold text-cspink-50"
      >
        Submit
      </button>
    </div>
  )
}

const ServerModal = () => {
  const open = useSelector(isActive("createServer", "openModal"))
  const [currentModal, setCurrentModal] = useState("")

  return (
    <ModalComp
      onClose={() => setTimeout(() => setCurrentModal(""), 150)}
      open={open}
      componentName="openModal"
    >
      <div className="relative w-96">
        <Transition
          show={currentModal === ""}
          className="absolute w-full transition-all duration-300 translate-y-[-50%]"
          enterFrom="opacity-0 translate-x-[-50%]"
          enterTo="opacity-100 translate-x-[0%]"
          leaveFrom="opacity-100 translate-x-[0%]"
          leaveTo="opacity-0 translate-x-[-50%]"
        >
          <div className="w-full transition-all duration-300 bg-csblue-200 flex flex-col gap-4 w-full p-5 rounded-md">
            <h1 className="text-2xl font-bold text-cspink-50">
              Create a new server or <br /> join one using an invite
            </h1>
            <div className="flex justify-between gap-2">
              <button
                onClick={(e) => setCurrentModal("createServer")}
                className="w-full p-2 bg-cspink-200 hover:bg-cspink-100 rounded-md text-xl font-bold text-cspink-50"
              >
                Create server
              </button>
              <button
                onClick={(e) => setCurrentModal("joinServer")}
                className="w-full p-2 border-[1px] border-cspink-200 rounded-md text-xl font-bold text-cspink-200"
              >
                Join server
              </button>
            </div>
          </div>
        </Transition>
        <Transition
          show={currentModal === "joinServer"}
          className="absolute w-full transition-all duration-300 translate-y-[-50%]"
          enterFrom="opacity-0 translate-x-[50%]"
          enterTo="opacity-100 translate-x-[0%]"
          leaveFrom="opacity-100 translate-x-[0%]"
          leaveTo="opacity-0 translate-x-[50%]"
        >
          <JoinServer onReturn={() => setCurrentModal("")} />
        </Transition>
        <Transition
          show={currentModal === "createServer"}
          className="absolute w-full transition-all duration-300 translate-y-[-50%]"
          enterFrom="opacity-0 translate-x-[50%]"
          enterTo="opacity-100 translate-x-[0%]"
          leaveFrom="opacity-100 translate-x-[0%]"
          leaveTo="opacity-0 translate-x-[50%]"
        >
          <CreateServer onReturn={() => setCurrentModal("")} />
        </Transition>
      </div>
    </ModalComp>
  )
}

export default ServerModal
