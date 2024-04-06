import { useDispatch } from "react-redux"
import { useSnackbar } from "notistack"
import { useStore } from "react-redux"
import { RootState } from "../components/redux/store"
import {
  channelAdded,
  channelChanged,
  channelRemoved,
  channelsRemoved,
  messageAdded,
  messageChanged,
  messageRemoved,
  serverAdded,
  serverChanged,
  serverRemoved,
  topicAdded,
  topicChanged,
  topicsRemoved,
  userChanged,
} from "../components/redux/reducers/chatReducer"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getSelfAsMember,
  memberAdded,
  memberChanged,
  memberRemoved,
  membersRemoved,
} from "../components/redux/reducers/memberReducer"
import {
  roleAdded,
  roleChanged,
  roleRemoved,
  rolesRemoved,
} from "../components/redux/reducers/roleReducer"
import { socket } from "./socketInitializer"
import { openModalChanged } from "../components/redux/reducers/UIReducer"
import { CHANNEL_IDS, Message, partialUser } from "../types"
import { pingAdded } from "../components/redux/reducers/pingReducer"
import { selfUserChanged } from "../components/redux/reducers/userReducer"

type params = {
  serverId: string
  channelId: string
}
export const SocketListener: React.FunctionComponent = () => {
  const [initialized, setInitialized] = useState(false)
  const dispatch = useDispatch()
  const store = useStore<RootState>()
  const { enqueueSnackbar } = useSnackbar()
  const getState: () => RootState = () => store.getState()

  const navigate = useNavigate()
  const { serverId, channelId } = useParams<params>() /// doesn't work cause socket listener isn't child of route

  useEffect(() => {
    if (initialized) return
    setInitialized(true)
    socket.on("serverAdded", (payload) => {
      dispatch(serverAdded(payload))
    })

    socket.on("channelAdded", (payload) => {
      const { user } = getState()

      const selfCreated = user._id === payload.authorId
      if (selfCreated && serverId && channelId === payload._id)
        navigate(
          `/app/servers/${payload.serverId}/${payload.topicId}/channels/${payload._id}`,
        )

      dispatch(channelAdded(payload))
    })
    socket.on("messageAdded", (payload) => {
      const message: Message = payload

      const state = getState()
      const user = state.user
      const channel = state.chat.channels[message.channelId]

      const member = getSelfAsMember(channel.serverId)(state)

      console.log(channel._id !== channelId)
      console.log(message.authorId !== user._id)
      if (channel._id !== channelId && message.authorId !== user._id) {
        if (
          message.mentions.includes(user._id) ||
          message.mentionedRoles.some((role) =>
            member?.roleIds.includes(role),
          ) ||
          channel.type === CHANNEL_IDS.DM ||
          channel.type === CHANNEL_IDS.GROUP_DM
        )
          dispatch(pingAdded({ messageId: message._id, channel: channel }))
      }

      dispatch(messageAdded(payload))
    })

    socket.on("messageChanged", (payload) => {
      dispatch(messageChanged(payload))
    })
    socket.on("memberAdded", (payload) => {
      dispatch(memberAdded(payload))
    })
    socket.on("topicAdded", (payload) => {
      dispatch(topicAdded(payload))
    })
    socket.on("roleAdded", (payload) => {
      dispatch(roleAdded(payload))
    })
    socket.on("inviteAdded", (payload) => {
      dispatch(openModalChanged("generateInvite"))
    })
    socket.on("userChanged", (payload: partialUser) => {
      const state = getState()
      const user = state.user
      if (payload._id === user._id) {
        dispatch(selfUserChanged(payload))
      }
      dispatch(userChanged(payload))
    })
    socket.on("channelChanged", (payload) => {
      dispatch(channelChanged(payload))
    })
    socket.on("memberChanged", (payload) => {
      dispatch(memberChanged(payload))
    })
    socket.on("roleChanged", (payload) => {
      dispatch(roleChanged(payload))
    })
    socket.on("serverChanged", (payload) => {
      dispatch(serverChanged(payload))
    })
    socket.on("topicChanged", (payload) => {
      dispatch(topicChanged(payload))
    })

    socket.on("channelRemoved", (payload) => {
      const removedChannelId = payload.channelId
      const authorId = payload.authorId

      const state = getState()
      const channel = state.chat.channels[removedChannelId]

      if (channel && authorId === state.user._id)
        navigate(`/app/servers/${channel.serverId}/${channel.topicId}`)

      dispatch(channelRemoved(channel))
    })

    socket.on("serverChannelPositionChanged", (payload) => {
      const channels = payload
      for (const channel of channels) {
        dispatch(channelChanged({ channel }))
      }
    })

    socket.on("memberRemoved", (payload) => {
      dispatch(memberRemoved(payload))
    })
    socket.on("messageRemoved", (payload) => {
      dispatch(messageRemoved(payload))
    })
    socket.on("roleRemoved", (payload) => {
      dispatch(roleRemoved(payload))
    })
    socket.on("serverRemoved", (payload) => {
      const { chat, members, roles } = getState()

      const serverChannels = Object.values(chat.channels).filter(
        (channel) => channel.serverId === payload,
      )
      const serverTopics = Object.values(chat.topics).filter(
        (topic) => topic.serverId === payload,
      )
      const serverMembers = Object.values(members).filter(
        (member) => member.serverId === payload,
      )
      const serverRoles = Object.values(roles).filter(
        (role) => role.serverId === payload,
      )
      dispatch(channelsRemoved(serverChannels))
      dispatch(topicsRemoved(serverTopics))
      dispatch(membersRemoved(serverMembers))
      dispatch(rolesRemoved(serverRoles))
      dispatch(serverRemoved(payload))
    })

    socket.on("friendRequestAdded", (payload) => {
      const state = getState()
      const user = state.user

      dispatch(
        selfUserChanged({ friendRequests: [...user.friendRequests, payload] }),
      )
    })
    socket.on("friendRequestRemoved", (payload) => {
      const state = getState()
      const user = state.user

      const newFriendRequests = user.friendRequests.filter(
        (friendRequest) =>
          friendRequest.transmitter !== payload.transmitter &&
          friendRequest.receiver !== payload.receiver,
      )

      dispatch(selfUserChanged({ friendRequests: newFriendRequests }))
    })
    socket.on("friendRemoved", (payload) => {
      const state = getState()
      const user = state.user

      const newFriends = user.friends.filter((friend) => friend !== payload)

      dispatch(selfUserChanged({ friends: newFriends }))
    })
    socket.on("friendAdded", (payload) => {
      const state = getState()
      const user = state.user

      const newFriendRequests = user.friendRequests.filter(
        (friendRequest) =>
          friendRequest.receiver !== payload &&
          friendRequest.transmitter !== payload,
      )

      dispatch(
        selfUserChanged({
          friends: [...user.friendRequests, payload],
          friendRequests: newFriendRequests,
        }),
      )
    })

    socket.onAny((event, ...args) => {
      console.log(event, args)
    })

    socket.on("error", (error) => {
      enqueueSnackbar({
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        message: error.message || "Unknown error",
      })
    })
  }, [initialized])

  return null
}

export default SocketListener
