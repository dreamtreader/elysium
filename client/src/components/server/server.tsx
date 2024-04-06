import { Server } from "../../types"
import { useDispatch, useSelector } from "react-redux"
import { useState, useMemo, useEffect } from "react"
import { store } from "../redux/store"
import PermService from "../../lib/perms"
import {
  getTopicChannels,
  getServerTopics,
} from "../redux/reducers/chatReducer"

import { Channel, Topic } from "../../types/entityTypes"
import ChannelComponent from "../channel/channel"

import FeatureList from "./featureList"
import TopicButton from "./topicButton"
import { openModalChanged } from "../redux/reducers/UIReducer"
import { useParams } from "react-router-dom"
import Menu from "../menu"
import { socket } from "../../socket/socketInitializer"
import GenerateInvite from "../modals/generateInvite"
import TopicSettings from "../modals/topicAndChannelSettings/topicSettings"
import ChannelSettings from "../modals/topicAndChannelSettings/channelSettings"
import CreateTopic from "../modals/createTopic"
import { getServerMembers } from "../../lib/DB"
import ChannelList from "../channel/channelList"

type params = {
  topicId: string
}
const ServerMenu = ({ server }: { server: Server }) => {
  const dispatch = useDispatch()
  const serverId = server._id

  const [invite, setInvite] = useState()
  const { topicId } = useParams<params>()

  const Perms = new PermService(store.getState())

  const topics = useSelector(getServerTopics(serverId))
  const channels = useSelector(getTopicChannels(topicId))

  useEffect(() => {
    if (!server.fetched) {
      getServerMembers(serverId, dispatch)
    }
  }, [serverId])

  const menuItems = useMemo(() => {
    return [
      [
        {
          content: "Server Settings",
          onClick: (e: any) =>
            dispatch(
              openModalChanged({ type: "serverSettings", entity: server._id }),
            ),
          condition: Perms.isAbleTo("MANAGE_SERVER", serverId),
        },
      ],
      [
        {
          content: "Invite people",
          onClick: (e: any) => {
            socket.emit("inviteAdded", { serverId: server._id })
            socket.once("inviteAdded", (invite) => setInvite(invite))
          },
        },
      ],
    ]
  }, [serverId])

  return (
    <>
      <div className="w-full grow-0 max-h-screen">
        <div className="max-h-screen p-2 flex flex-col">
          <div
            {...(server.banner && {
              style: {
                backgroundImage: `url(${server.banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              },
            })}
            className="w-full flex justify-between items-start p-2 aspect-video bg-csblue-400 rounded-md rounded-b-none"
          >
            <div className="max-w-20 text-ellipsis overflow-hidden flex rounded-md p-4 gap-2 items-center backdrop-blur-sm bg-csblue-700 bg-opacity-40">
              <span
                {...(server.avatar && {
                  style: {
                    backgroundImage: `url(${server.avatar})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  },
                })}
                className="w-10 aspect-square bg-csblue-100 rounded-full"
              ></span>
              <h1 className="whitespace-nowrap overflow-hidden text-ellipsis text-lg font-extrabold text-cspink-50">
                {server.name}
              </h1>
            </div>
            <Menu
              button={(open) => (
                <>
                  {open ? (
                    <i className="bi bi-chevron-down text-cspink-50"></i>
                  ) : (
                    <i className="bi bi-chevron-left text-csblue-50 hover:text-cspink-50"></i>
                  )}
                </>
              )}
              placement="down"
              menuItems={menuItems}
            />
          </div>
          <div className=" bg-csblue-200">
            <FeatureList />
            <div className="h-2 w-full flex gap-2 items-center">
              <div className="w-full h-[20%] bg-csblue-300" />
              {Perms.isAbleTo("MANAGE_CHANNEL", serverId) ? (
                <button
                  onClick={(e) =>
                    dispatch(openModalChanged({ type: "createTopic" }))
                  }
                  className="text-2xl flex justify-center text-csblue-400 items-center hover:text-csblue-100"
                >
                  <i className="bi bi-plus"></i>
                </button>
              ) : null}
            </div>
            <ul className="grid grid-cols-3 py-2 gap-2">
              {topics.map((topic: Topic) => (
                <TopicButton key={topic._id} topic={topic} />
              ))}
            </ul>
            <div className="h-2 w-full flex gap-2 items-center">
              <div className="w-full h-[20%] bg-csblue-300" />
              {topicId ? (
                Perms.isAbleToInTopic("MANAGE_CHANNEL", serverId, topicId) ? (
                  <button
                    onClick={(e) =>
                      dispatch(openModalChanged({ type: "createChannel" }))
                    }
                    className="text-2xl flex justify-center text-csblue-400 items-center hover:text-csblue-100"
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                ) : null
              ) : null}
            </div>
          </div>
          {topicId ? (
            <ul className="max-h overflow-y-auto w-full pt-2 pr-2 flex flex-col gap-2">
              {channels.length ? (
                <ChannelList channels={channels} />
              ) : (
                <div>No channels to show.</div>
              )}
            </ul>
          ) : null}
        </div>
      </div>
      <GenerateInvite invite={invite} />
      <CreateTopic />
      <ChannelSettings />
      <TopicSettings />
    </>
  )
}

export default ServerMenu
