import Modal from "../Modal"
import { useDispatch, useSelector } from "react-redux"
import { isActive, componentClosed } from "../redux/reducers/UIReducer"
import { Invite } from "../../types"

const GenerateInvite = ({ invite }: { invite?: Invite }) => {
  const dispatch = useDispatch()

  const open = useSelector(isActive("generateInvite", "openModal"))

  return (
    <Modal open={open} onClose={() => dispatch(componentClosed("openModal"))}>
      <div className="bg-csblue-200 flex flex-col gap-2 w-screen max-w-md p-5 rounded-md">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-cspink-50">
            {invite ? "Invite generated" : "Generating invite.."}
          </h1>
          {invite ? (
            <p className="text-md font-semibold text-csblue-50">
              Share it with your friends!
            </p>
          ) : null}
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1">
            <label htmlFor="ID" className="text-cspink-200 font-bold text-lg">
              ID
            </label>

            <input
              type="text"
              readOnly={true}
              value={invite?._id || ".."}
              name="name"
              className="bg-csblue-400 rounded-md p-2 text-cspink-200"
            />
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default GenerateInvite
