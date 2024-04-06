import Modal from "../../components/Modal"

import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { componentClosed, isActive } from "../redux/reducers/UIReducer"
import { socket } from "../../socket/socketInitializer"
const ChangeStatus = () => {
  const dispatch = useDispatch()
  const open = useSelector(isActive("changeStatus", "openModal"))
  const [formState, setFormState] = useState({
    status: "",
  })

  const onSubmit = async () => {
    try {
      if (!formState.status) return
      socket.emit("userChanged", { status: formState.status })
      dispatch(componentClosed("openModal"))
      setFormState({ status: "" })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Modal open={open} onClose={() => dispatch(componentClosed("openModal"))}>
      <div className="bg-csblue-200 flex flex-col gap-4 w-screen max-w-md p-5 rounded-md">
        <h1 className="text-2xl font-bold text-cspink-50">
          Change your status
        </h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-cspink-200 font-bold text-lg">
              STATUS
            </label>

            <input
              type="text"
              value={formState.status}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  status: e.target.value,
                })
              }
              maxLength={128}
              name="status"
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

export default ChangeStatus
