import Modal from "../../components/Modal"

import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { isActive, componentClosed } from "../redux/reducers/UIReducer"
import { useParams } from "react-router-dom"
import { socket } from "../../socket/socketInitializer"
type params = {
  serverId: string
}

const CreateTopic = () => {
  const dispatch = useDispatch()
  const [formState, setFormState] = useState({
    name: "",
  })
  const { serverId } = useParams<params>()
  const open = useSelector(isActive("createTopic", "openModal"))

  const onSubmit = async () => {
    try {
      if (!serverId) return

      socket.emit("topicAdded", {
        serverId: serverId,
        ...(formState.name.length && { name: formState.name }),
      })

      dispatch(componentClosed("openModal"))
      setFormState({ name: "" })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Modal open={open} onClose={() => dispatch(componentClosed("openModal"))}>
      <div className="bg-csblue-200 flex flex-col gap-4 w-screen max-w-md p-5 rounded-md">
        <h1 className="text-2xl font-bold text-cspink-50">
          Create a new topic
        </h1>
        <form onSubmit={(e) => e.preventDefault()}>
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
              minLength={1}
              maxLength={32}
              name="name"
              className="bg-csblue-400 rounded-md p-2 text-cspink-200"
            />
          </div>
        </form>
        <button
          onClick={(e) => onSubmit()}
          className="w-full p-2 bg-cspink-200 hover:bg-cspink-100 rounded-md text-xl font-bold text-cspink-50"
        >
          Submit
        </button>
      </div>
    </Modal>
  )
}

export default CreateTopic
