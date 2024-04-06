import { Link, useParams } from "react-router-dom"
import { Topic } from "../../types"
import { useDispatch, useSelector } from "react-redux"
import Tooltip from "../tooltip"
import { activeTopicChanged } from "../redux/reducers/chatReducer"
import { useState } from "react"

type params = {
  topicId: string
}

import TopicMenu from "../contextualMenus/topic"
import { getTopicPings } from "../redux/reducers/pingReducer"
import PingIcon from "../chat/pingIcon"
const TopicButton = ({ topic }: { topic: Topic }) => {
  const pings = useSelector(getTopicPings(topic._id, topic.serverId))

  const dispatch = useDispatch()

  const { topicId } = useParams<params>()
  const [contextualOpen, setContextualOpen] = useState(false)
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })

  return (
    <>
      <Tooltip placement="up" text={topic.name}>
        <PingIcon pingLength={pings.length ?? 0}>
          <Link
            {...(topic.avatar && {
              style: {
                backgroundImage: `url(${topic.avatar})`,
                backgroundSize: "cover",
                backgroundColor: topic.color,
              },
            })}
            onClick={(e) =>
              dispatch(
                activeTopicChanged({
                  serverId: topic.serverId,
                  activeTopic: topic._id,
                }),
              )
            }
            onContextMenu={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setCoordinates({ x: e.pageX, y: e.pageY })
              setContextualOpen(true)
              window.addEventListener("click", (e) => {
                e.stopPropagation()
                setContextualOpen(false)
                window.removeEventListener("click", () => {})
              })
            }}
            to={topic._id}
            className={`text-2xl text-cspink-200 hover:text-cspink-50 ${
              !topic.color && !topic.avatar
                ? `${
                    topicId == topic._id
                      ? `bg-cspink-200 hover:bg-cspink-100 text-cspink-50`
                      : `bg-csblue-300 hover:bg-cspink-100`
                  }`
                : null
            } ${
              topic.avatar
                ? topicId == topic._id
                  ? "brightness-[100%]"
                  : "brightness-[80%] hover:brightness-[100%]"
                : null
            } transition-all duration-200 ease-out w-full aspect-square rounded-md flex justify-center items-center `}
          >
            {!topic.avatar
              ? topic.iconId
                ? topic.iconId
                : topic.name
                    .toUpperCase()
                    .split(" ")
                    .map((string) => string.charAt(0))
              : null}
          </Link>
        </PingIcon>
      </Tooltip>
      <TopicMenu
        open={contextualOpen}
        topic={topic}
        coordinates={coordinates}
      />
    </>
  )
}

export default TopicButton
