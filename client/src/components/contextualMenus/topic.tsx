import { useDispatch } from "react-redux"
import MenuItems from "../contextualMenu"
import { openModalChanged } from "../redux/reducers/UIReducer"
import PermService from "../../lib/perms"
import { store } from "../redux/store"
import { Topic } from "../../types"
export const TopicMenu = ({
  topic,
  open,
  coordinates,
  className,
}: {
  topic: Topic
  open: boolean
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
            content: "Edit topic",
            condition:
              perms.isAbleTo("MANAGE_CHANNEL", topic.serverId) &&
              perms.isAbleToInTopic("VIEW_CHANNEL", topic.serverId, topic._id),
            onClick: (e) =>
              dispatch(
                openModalChanged({ type: "topicSettings", entity: topic._id }),
              ),
          },
        ],
      ]}
    />
  )
}

export default TopicMenu
