import { useSelector } from "react-redux"

import { useParams } from "react-router-dom"
import { getServerById, getTopicById } from "../../redux/reducers/chatReducer"

import Presentation from "./topicPresentation"
import SettingsLayout from "../../settingsLayout"
import Overwrites from "./overwrites"
import { getOpenModal } from "../../redux/reducers/UIReducer"
import { useMemo } from "react"
import PermService from "../../../lib/perms"
import { store } from "../../redux/store"

const TopicSettings = () => {
  const openModal = useSelector(getOpenModal())
  const perms = new PermService(store.getState())
  const topic = useSelector(getTopicById(openModal?.entity))

  const settings = useMemo(
    () => [
      {
        name: "General",
        children: [
          { name: "Presentation" },
          { name: "Permission Overwrites" },
          {
            name: "Delete topic",
            danger: true,
            condition: topic
              ? perms.isAbleToInTopic(
                  "MANAGE_CHANNEL",
                  topic?.serverId,
                  topic?._id,
                )
              : null,
          },
        ],
      },
    ],
    [topic],
  )

  const open = openModal?.type === "topicSettings" && topic !== undefined

  const components = [
    <Presentation topic={topic} />,
    <Overwrites entity={topic} type="topic" />,
  ]
  return <SettingsLayout open={open} list={settings} components={components} />
}

export default TopicSettings
