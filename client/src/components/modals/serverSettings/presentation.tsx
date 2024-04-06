import { useEffect, useMemo, useState } from "react"
import { Server } from "../../../types"

import ProfileInput from "../../input/profileInput"
import Crop from "../../crop"

import {
  isActive,
  saveChangesOpened,
  componentClosed,
  openCropperChanged,
} from "../../redux/reducers/UIReducer"
import { useDispatch, useSelector } from "react-redux"
import SaveChanges from "../saveChangesNew"
import { socket } from "../../../socket/socketInitializer"

const Presentation = ({ server }: { server: Server }) => {
  const [initialFormState, setInitialFormState] = useState({
    name: server?.name,
    avatar: server?.avatar,
    banner: server?.banner,
  })
  const [formState, setFormState] = useState({
    name: server?.name,
    avatar: server?.avatar,
    banner: server?.banner,
  })

  const saveChangesOpen = useSelector(isActive(true, "saveChanges"))

  const dispatch = useDispatch()
  useEffect(() => {
    const edited = Object.keys(initialFormState).find(
      (field) => initialFormState[field] !== formState[field],
    )
    if (edited && !saveChangesOpen) {
      dispatch(saveChangesOpened(true))
    }
    if (saveChangesOpen && !edited?.length)
      dispatch(componentClosed("saveChanges"))
  }, [formState])

  return (
    <div className="max-w-[740px] min-h-[460px] grow shrink h-full px-[60px] pt-20">
      <h1 className="font-bold text-lg text-cspink-50 mb-2">
        Server Presentation
      </h1>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-[1fr,_8rem] gap-10"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-cspink-100 font-bold text-lg">NAME</h2>
          <input
            className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300`}
            type="text"
            maxLength={100}
            placeholder="Type in a new name.."
            value={formState.name}
            onChange={(e) =>
              setFormState({ ...formState, name: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-cspink-100 font-bold text-lg">AVATAR</h2>
          <ProfileInput
            src={formState.avatar}
            setValue={(value: string) => {
              dispatch(
                openCropperChanged({
                  src: value,
                  onCrop: (value: string) =>
                    setFormState({ ...formState, avatar: value }),
                }),
              )
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-cspink-100 font-bold text-lg">BANNER</h2>
          <ProfileInput
            className="z-1 w-full aspect-video rounded-t-md bg-csblue-500 rounded-none"
            src={formState.banner}
            penClassName="w-[3rem]"
            setValue={(value: string) => {
              dispatch(
                openCropperChanged({
                  aspectRatio: 16 / 9,
                  src: value,
                  onCrop: (value: string) =>
                    setFormState({ ...formState, banner: value }),
                }),
              )
            }}
          />
        </div>
      </form>
      <Crop />
      <SaveChanges
        onSave={() => {
          socket.emit("serverChanged", { ...formState, serverId: server._id })
          socket.once("serverChanged", (server) => {
            setInitialFormState({
              name: server.name,
              avatar: server.avatar,
              banner: server.banner,
            })
          })
        }}
        onReset={() => setFormState(initialFormState)}
      />
    </div>
  )
}

export default Presentation
