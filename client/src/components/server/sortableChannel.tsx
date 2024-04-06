import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import ChannelComp from "../channel/channel"
import { Channel } from "../../types"

export default function SortableChannel(props: {
  id: string
  channel: Channel
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <ChannelComp
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      channel={props.channel}
    />
  )
}
