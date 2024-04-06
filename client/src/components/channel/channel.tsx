import { Link, useParams } from "react-router-dom"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { activeChannelChanged } from "../redux/reducers/chatReducer"

import { forwardRef } from "react"
import { ChannelMenu } from "../contextualMenus"
import { Channel } from "../../types"
import { RootState } from "../redux/store"
import { getServerChannelPings } from "../redux/reducers/pingReducer"

type params = {
  channelId: string
}

const ChannelComponent = ({ channel, ...props }) => {
  const lastReadMessageIds = useSelector(
    (state: RootState) => state.user.lastReadMessageIds,
  )

  const pings =
    useSelector(getServerChannelPings(channel?.serverId, channel?._id)) ?? []

  const dispatch = useDispatch()
  const { channelId } = useParams<params>()
  const [open, setOpen] = useState(false)
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })

  return (
    <div>
      <span
        onClick={(e) =>
          dispatch(
            activeChannelChanged({
              channelId: channel?._id,
              serverId: channel?.serverId,
            }),
          )
        }
        {...props}
        className={`${
          channelId == channel?._id
            ? `bg-cspink-200 text-cspink-50 hover:bg-cspink-100`
            : lastReadMessageIds[channel?._id] !== channel?.lastMessageId
            ? `bg-csblue-150 hover:bg-csblue-100 text-cspink-50`
            : `bg-csblue-300 text-csblue-100 hover:text-csblue-50 hover:bg-csblue-100`
        } iconbutton font-semibold inline-flex justify-between items-center px-2 w-full rounded-md p-1 channel_list_item`}
      >
        <Link
          className="w-full"
          onContextMenu={(e) => {
            e.preventDefault()
            setOpen(true)
            setCoordinates({ x: e.pageX, y: e.pageY })
            window.addEventListener("click", (e) => {
              e.stopPropagation()
              setOpen(false)
              window.removeEventListener("click", () => {})
            })
          }}
          to={`${channel?.topicId}/channels/${channel?._id}`}
        >
          @{channel?.name}
        </Link>
        {pings?.length && channelId !== channel?._id ? (
          <span className="bg-red-400 h-5 w-5 flex justify-center items-center rounded-full border-2 font-bold border-csblue-400 text-[0.6rem] p-2">
            {pings?.length}
          </span>
        ) : lastReadMessageIds[channel?._id] !== channel?.lastMessageId &&
          channelId !== channel?._id ? (
          <span className="bg-cspink-50 h-2 w-2 mr-1 inline-block rounded-full" />
        ) : null}
      </span>
      <ChannelMenu channel={channel} open={open} coordinates={coordinates} />
    </div>
  )
}

export default ChannelComponent
