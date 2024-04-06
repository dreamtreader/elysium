import { useState } from "react"
import { ReactSortable } from "react-sortablejs"
import { Channel, Role } from "../../types"
import ChannelComponent from "./channel"
import { socket } from "../../socket/socketInitializer"
import { sortByPosition } from "../../lib/sortFunctions"
import { useParams } from "react-router-dom"

type params = {
  serverId: string
  topicId: string
}
const ChannelList = ({ channels }: { channels: Channel[] }) => {
  const [state, setState] = useState(
    channels
      .sort((a, b) => (a.position > b.position ? 1 : -1))
      .map((channel) => ({ ...channel, id: channel._id })),
  )
  const { serverId, topicId } = useParams<params>()

  if (!serverId || !topicId) return null

  return (
    <ReactSortable
      swap={true}
      className="flex flex-col gap-2"
      onEnd={(e) => {
        socket.emit("serverChannelPositionChanged", {
          oldIndex: e.oldIndex,
          newIndex: e.newIndex,
          serverId: serverId,
          topicId: topicId,
        })
        console.log({ oldIndex: e.oldIndex, newIndex: e.newIndex })
      }}
      list={state}
      setList={setState}
    >
      {state.map((item) => (
        <ChannelComponent key={item?.id} channel={item} />
      ))}
    </ReactSortable>
  )
}

export default ChannelList
