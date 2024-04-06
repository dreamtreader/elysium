import { Fragment, useRef, ReactNode } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useDispatch } from "react-redux"
import { componentClosed } from "./redux/reducers/UIReducer"
import { useSnackbar } from "notistack"
import { componentName } from "../types"

type Props = {
  children: ReactNode
  open: boolean
  onClose?(): void
  componentName?: componentName
}

const ModalComp = ({ children, open, onClose, componentName }: Props) => {
  const { closeSnackbar } = useSnackbar()
  const dispatch = useDispatch()

  function onCloseExpanded() {
    if (onClose) onClose()
    closeSnackbar("saveChanges")
    dispatch(componentClosed("saveChanges"))
    if (componentName) dispatch(componentClosed(componentName))
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog onClose={() => onCloseExpanded()} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-100"
        >
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25"
            aria-hidden="true"
          />
        </Transition.Child>
        <div className=" fixed inset-0 flex flex-col justify-center items-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="block">{children}</Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ModalComp
