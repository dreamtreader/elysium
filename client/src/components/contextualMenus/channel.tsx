import { useDispatch } from "react-redux"
import MenuItems from "../contextualMenu"

import { openModalChanged } from "../redux/reducers/UIReducer"
import { Channel } from "../../types"
import PermService from "../../lib/perms"
import { store } from "../redux/store"
import { socket } from "../../socket/socketInitializer"
export const ChannelMenu = ({
  open,
  coordinates,
  className,
  channel,
}: {
  open: boolean
  channel?: Channel
  className?: string
  coordinates?: { x: number; y: number }
}) => {
  const dispatch = useDispatch()
  const perms = new PermService(store.getState())
  return (
    <MenuItems
      className={className}
      open={open}
      coordinates={coordinates}
      menuItems={[
        [
          {
            content: "Edit channel",
            condition:
              perms.isAbleTo("MANAGE_CHANNEL", channel?.serverId) &&
              perms.isAbleToInChannel(
                "VIEW_CHANNEL",
                channel?.serverId,
                channel?._id,
              ),
            onClick: (e) =>
              dispatch(
                openModalChanged({
                  type: "channelSettings",
                  entity: channel?._id,
                }),
              ),
          },
        ],
        [
          {
            content: "Delete channel",
            danger: true,
            condition:
              perms.isAbleTo("MANAGE_CHANNEL", channel?.serverId) &&
              perms.isAbleToInChannel(
                "VIEW_CHANNEL",
                channel?.serverId,
                channel?._id,
              ),
            onClick: (e) =>
              socket.emit("channelRemoved", {
                channelId: channel?._id,
                serverId: channel?.serverId,
              }),
          },
        ],
      ]}
    />
  )
}

export default ChannelMenu
