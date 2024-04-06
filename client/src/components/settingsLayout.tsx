import { useState } from "react"

import { useDispatch, useSelector } from "react-redux"
import { isActive, componentClosed } from "./redux/reducers/UIReducer"

import { useSnackbar } from "notistack"
import Modal from "./Modal"
import { componentName } from "../types"

type setting = {
  name: string
  onClick?: () => any
  danger?: boolean
  condition?: boolean | Boolean
}
type settingsList = {
  name: string
  children: setting[]
}[]

const SettingsLayout = ({
  list,
  components,
  open,
  onClose,
}: {
  list: settingsList
  components: JSX.Element[]
  open: boolean
  onClose?: () => any
}) => {
  const dispatch = useDispatch()
  const [index, setIndex] = useState(0)
  const { closeSnackbar } = useSnackbar()
  const saveChangesOpen: boolean = useSelector(isActive(true, "saveChanges"))

  return (
    <Modal open={open}>
      <main className="z-30 w-screen h-screen bg-csblue-200 flex justify-center">
        <div className="w-full h-full flex">
          <section className="shrink-0 grow basis-[218px] flex justify-end bg-csblue-300">
            <ul className="w-[218px] flex flex-col gap-2 p-4 pt-20">
              {list.map((category, categIndex) => (
                <div key={category.name} className="flex flex-col">
                  <h1 className="p-1 font-extrabold text-cspink-50">
                    {category.name.toUpperCase()}
                  </h1>
                  <ul className="flex flex-col gap-1">
                    {category.children.map((child, ind) =>
                      child.condition === true ||
                      child.condition === undefined ? (
                        <button
                          key={child.name}
                          onClick={(e) => {
                            child.onClick ? child.onClick() : setIndex(ind)
                            if (saveChangesOpen) {
                              closeSnackbar("saveChanges")
                              dispatch(componentClosed("saveChanges"))
                              dispatch(componentClosed("openCropper"))
                            }
                          }}
                          className={`inline-flex w-full p-1 rounded-md text-md ${
                            ind === index
                              ? child.danger
                                ? "bg-red-400 text-cspink-50"
                                : "text-cspink-50 bg-cspink-200"
                              : child.danger
                              ? "hover:text-red-500 text-red-400"
                              : "text-csblue-50 hover:text-cspink-50 hover:bg-csblue-200"
                          } font-md`}
                        >
                          {child.name}
                        </button>
                      ) : null,
                    )}
                  </ul>
                </div>
              ))}
            </ul>
          </section>
          <section className="grow shrink basis-[800px] flex align-start">
            {components[index]}
            <div className="relative flex basis-[36px] pl-[10px] w-[60px] pt-[60px]">
              <button
                onClick={(e) => {
                  onClose ? onClose() : null
                  dispatch(componentClosed("openModal"))
                }}
                className="fixed w-8 self-start flex justify-center items-center rounded-full aspect-square border-[2px] border-csblue-100 text-csblue-100 text-lg "
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </section>
        </div>
      </main>
    </Modal>
  )
}

export default SettingsLayout
