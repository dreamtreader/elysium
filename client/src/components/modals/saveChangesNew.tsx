import { Fragment } from "react"
import { createPortal } from "react-dom"
import { useDispatch, useSelector } from "react-redux"
import { componentClosed, isActive } from "../redux/reducers/UIReducer"
import { Transition } from "@headlessui/react"
const SaveChanges = ({
  onSave,
  onReset,
}: {
  onSave: () => any
  onReset: () => any
}) => {
  const dispatch = useDispatch()
  const open = useSelector(isActive(true, "saveChanges"))

  return createPortal(
    <Transition appear as={Fragment} show={open}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-[0%]"
        enterTo="opacity-100 translate-y-[-110%]"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-[-110%]"
        leaveTo="opacity-0 translate-y-[0%]"
      >
        <div
          style={{ zIndex: 120 }}
          className="absolute top-[100%] left-[50%] translate-x-[-50%] rounded-md w-[50vw] flex justify-between items-center text-cspink-50 p-2 bg-csblue-500"
        >
          <p>Don't forget - You've got unsaved changes!</p>
          <div className="flex gap-2 flex-col sm:flex-row">
            <button
              style={{ zIndex: 120 }}
              onClick={(e) => {
                onReset()
                dispatch(componentClosed("saveChanges"))
              }}
              className="p-2 text-cspink-200 rounded-md border-2 border-cspink-200 hover:border-cspink-100 hover:text-cspink-100"
            >
              Reset
            </button>
            <button
              onClick={(e) => {
                onSave()
                dispatch(componentClosed("saveChanges"))
              }}
              className="p-2 text-cspink-50 rounded-md bg-cspink-200 hover:bg-cspink-100"
            >
              Save
            </button>
          </div>
        </div>
      </Transition.Child>
    </Transition>,
    document.getElementById("notistack") || document.body,
  )
}

export default SaveChanges
