import { useEffect, useState } from "react"
import { Channel } from "../../../types"

import ProfileInput from "../../input/profileInput"
import Crop from "../../crop"

import {
  isActive,
  saveChangesOpened,
  componentClosed,
} from "../../redux/reducers/UIReducer"
import { useDispatch, useSelector } from "react-redux"
import SaveChanges from "../saveChangesNew"
import { socket } from "../../../socket/socketInitializer"

const Presentation = ({ channel }: { channel: Channel }) => {
  const [initialFormState, setInitialFormState] = useState({
    name: channel?.name || "",
    description: channel?.description || "",
  })
  const [formState, setFormState] = useState({
    name: channel?.name || "",
    description: channel?.description || "",
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
      <h1 className="font-bold text-lg text-cspink-50 pb-2">
        Channel Presentation
      </h1>
      <form className="flex flex-col divide-csblue-100 divide-y-[1px]">
        <div className="flex flex-col gap-1 mb-8">
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
        <div className="flex flex-col gap-1 pt-8">
          <h2 className="text-cspink-100 font-bold text-lg">DESCRIPTION</h2>
          <input
            className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300`}
            type="text"
            maxLength={100}
            placeholder="Type in a new description.."
            value={formState.description}
            onChange={(e) =>
              setFormState({ ...formState, description: e.target.value })
            }
          />
        </div>
      </form>
      <SaveChanges
        onSave={() => {
          socket.emit("serverChannelChanged", {
            ...formState,
            serverId: channel.serverId,
            channelId: channel._id,
          })
          socket.once("channelChanged", (channel) => {
            setInitialFormState(formState)
          })
        }}
        onReset={() => setFormState(initialFormState)}
      />
    </div>
  )
}

export default Presentation
