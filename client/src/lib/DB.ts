import axios from "axios"
import {
  channelChanged,
  channelAdded,
  serverChanged,
  topicAdded,
  messageHistoryRefreshed,
  messagesAdded,
  postsAdded,
  postChanged,
  postRemoved,
} from "../components/redux/reducers/chatReducer"
import {
  membersAdded,
  memberAdded,
  loggedOut as loggedOutMembers,
} from "../components/redux/reducers/memberReducer"
import {
  userAdded,
  usersAdded,
  serverAdded,
  chatDataLoaded,
} from "../components/redux/reducers/chatReducer"
import { Dispatch } from "@reduxjs/toolkit"
import {
  rolesAdded,
  roleAdded,
  loggedOut as loggedOutRoles,
} from "../components/redux/reducers/roleReducer"
import {
  attemptedToLogin,
  loggedOut,
  signIn,
  setLastReadMessage,
  selfUserChanged,
} from "../components/redux/reducers/userReducer"
import { loggedOut as loggedOutChat } from "../components/redux/reducers/chatReducer"
import { loggedOut as loggedOutUI } from "../components/redux/reducers/UIReducer"
import { loggedOut as loggedOutSearch } from "../components/redux/reducers/searchReducer"
import {
  pingsInitialized,
  loggedOut as loggedOutPing,
} from "../components/redux/reducers/pingReducer"

import { CHANNEL_IDS, Post, partialUser } from "../types"
import { socket } from "../socket/socketInitializer"
import { ReactEditor } from "slate-react"
import { HistoryEditor } from "slate-history"
import { BaseEditor } from "slate"
import { store } from "../components/redux/store"

axios.defaults.withCredentials = true

export const loginByToken = async (dispatch: Dispatch) => {
  const url = "http://localhost:5000/user"
  const username = localStorage.getItem("username")
  const password = localStorage.getItem("password")
  try {
    const response: any = await axios.get(url, {
      withCredentials: true,
    })
    if (response.data) {
      dispatch(signIn(response.data))
    } else if (username && password) {
      const secondResponse: any = await axios.post(url + "/login", {
        username: username,
        password: password,
      })
      if (secondResponse.data) dispatch(signIn(secondResponse.data))
    }
  } catch (err) {
    console.log(err)
  }
  dispatch(attemptedToLogin(true))
}

export const Logout = async (dispatch: Dispatch) => {
  const url = "http://localhost:5000/user/logout"
  try {
    const response: any = await axios.get(url)

    socket.disconnect()
    dispatch(loggedOut({}))
    dispatch(loggedOutChat({}))
    dispatch(loggedOutMembers({}))
    dispatch(loggedOutPing({}))
    dispatch(loggedOutRoles({}))
    dispatch(loggedOutUI({}))
    dispatch(loggedOutUI({}))
  } catch (err) {
    console.log(err)
  }
}
export const fetchUser = async (userId: string, dispatch: Dispatch) => {
  const url = "http://localhost:5000/user" + userId
  try {
    const response = await axios.get<partialUser>(url)
    if (response.data) {
      dispatch(userAdded(response.data))
      socket.emit("usersFetched", [response.data._id])
    }
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const SetLastReadMessage = async (
  dispatch: Dispatch,
  channelId: string,
  messageId: string,
) => {
  const url = "http://localhost:5000/user/lastReadMessages/" + channelId
  try {
    const response = await axios.post(url, { messageId: messageId })
    if (response.data) {
      dispatch(
        setLastReadMessage({ messageId: messageId, channelId: channelId }),
      )
    }
  } catch (err) {
    console.log(err)
  }
}

export const editUser = async ({
  oldPassword,
  password,
  email,
  dispatch,
}: {
  oldPassword: string
  password?: string
  email?: string
  dispatch: Dispatch
}) => {
  const url = "http://localhost:5000/user/edit"
  try {
    const response = await axios.post(url, {
      ...(oldPassword && { oldPassword: oldPassword }),
      ...(password && { password: password }),
      ...(email && { email: email }),
    })
    if (response.data) {
      dispatch(selfUserChanged(response.data))
    }
  } catch (err) {
    console.log(err)
  }
}
export const getFilteredMessages = async ({
  serverId,
  options,
  channelId,
}: {
  serverId?: string
  channelId?: string
  options?: {
    channelId?: string
    before?: string
    after?: string
    pinned?: string
    from?: string
    page?: string
    input?: string
  }
}) => {
  var url = serverId
    ? "http://localhost:5000/servers/" + serverId + "/messages?"
    : "http://localhost:5000/channels/" + channelId + "/messages/filter?"
  const params = new URLSearchParams(options)

  url += params.toString()

  console.log(url)
  try {
    const response: any = await axios.get(url)
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const LoadChatData = async (dispatch: Dispatch) => {
  const url = "http://localhost:5000/chat/"
  try {
    const response: any = await axios.get(url, {
      withCredentials: true,
    })
    if (response.data) {
      const channels: { [key: string]: {} } = response.data.channels.reduce(
        (a: any, v: { _id: string; serverId: string }) => {
          const pings = response.data.pings.servers[v.serverId]?.[v._id]
          return {
            ...a,
            [v._id]: {
              ...v,
              fetched: false,
              fullyFetched: false,
              messages: pings ?? [],
            },
          }
        },
        {},
      )

      const topics = response.data.topics.reduce(
        (a: any, v: { _id: string; serverId: string }) => {
          return {
            ...a,
            [v._id]: v,
          }
        },
        {},
      )

      const servers = response.data.members.reduce(
        (a: any, v: { _id: string; serverId: { _id: string } }) => {
          return {
            ...a,
            [v.serverId._id]: {
              ...v.serverId,
              fetched: false,
              defaultTopic: "Feed",
            },
          }
        },
        {},
      )
      const members = response.data.members.map((member: any) => {
        member.serverId = member.serverId._id
        return member
      })

      const users = response.data.users.reduce((a: any, v: partialUser) => {
        return {
          ...a,
          [v._id]: {
            avatar:
              "https://res.cloudinary.com/dnpgwek4e/image/upload/v1680872064/avatars/default.png",
            ...v,
          },
        }
      }, {})

      socket.emit(
        "usersFetched",
        response.data.users.map((user) => user._id),
      )

      dispatch(
        chatDataLoaded({
          servers: servers,
          channels: channels,
          users: users,
          topics: topics,
          fetched: true,
        }),
      )
      console.log(response.data.pings)
      socket.emit("activityStatusChanged", { isOnline: true })
      dispatch(pingsInitialized(response.data.pings))
      dispatch(rolesAdded(response.data.roles))
      dispatch(membersAdded(members))
    }
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const getServerMembers = async (
  serverId: string,
  dispatch: Dispatch,
) => {
  const url = "http://localhost:5000/servers/" + serverId + "/members"
  const response = await axios.get(url, { withCredentials: true })
  if (response.data) {
    dispatch(usersAdded(response.data.users))
    socket.emit(
      "usersFetched",
      response.data.users.map((user) => user._id),
    )
    dispatch(membersAdded(response.data.members))
  }
  dispatch(serverChanged({ _id: serverId, fetched: true }))
}

export const GetChannelMessages = async (
  channelId: string,
  dispatch: Dispatch,
  lastMessageDate?: string,
) => {
  var url = "http://localhost:5000/channels/" + channelId + "/messages"
  if (lastMessageDate) url = url + "?before=" + lastMessageDate
  try {
    const response = await axios.get(url, { withCredentials: true })
    if (response.data) {
      const messages = response.data
      dispatch(
        messageHistoryRefreshed({
          channelId: channelId,
          messages: messages.reverse(),
        }),
      )
      dispatch(
        channelChanged({
          fetched: true,
          ...(response.data.length < 5 && { fullyFetched: true }),
          _id: channelId,
        }),
      )
    } else {
      dispatch(
        channelChanged({
          fetched: true,
          fullyFetched: true,
          _id: channelId,
        }),
      )
    }
  } catch (err) {
    console.log(err)
  }
}

export const getPosts = async ({
  input,
  serverId,
  topicId,
  dispatch,
  lastPost,
}: {
  input?: string
  serverId: string
  topicId: string
  lastPost?: Post
  dispatch: Dispatch
}) => {
  const sortField = store.getState().chat.postSortField
  var url = `http://localhost:5000/servers/${serverId}/${topicId}/posts`
  url += `?sortField=${sortField}`
  if (lastPost) url += `&lastPostSortVal=${lastPost[sortField]}`
  if (input) url += `&input=${input}`
  try {
    const response = await axios.get(url)
    if (response.data) {
      const users = response.data.map((post) => post.authorId)
      socket.emit(
        "usersFetched",
        users.map((user) => user._id),
      )
      const posts = response.data.map((post) => {
        post.authorId = post.authorId._id
        return post
      })
      dispatch(usersAdded(users))
      dispatch(postsAdded(posts))
    }
  } catch (error) {
    console.log(error)
  }
}

export const getPost = async ({
  postId,
  serverId,
  topicId,
  dispatch,
}: {
  postId: string
  serverId: string
  topicId: string
  dispatch: Dispatch
}) => {
  var url = `http://localhost:5000/servers/${serverId}/${topicId}/posts/${postId}`
  try {
    const response = await axios.get(url)
    if (response.data) {
      dispatch(postChanged({ ...response.data, fullyFetched: true }))
    }
  } catch (error) {
    console.log(error)
  }
}

export const deletePost = async ({
  postId,
  serverId,
  topicId,
  dispatch,
}: {
  postId: string
  serverId: string
  topicId: string
  dispatch: Dispatch
}) => {
  var url = `http://localhost:5000/servers/${serverId}/${topicId}/posts/${postId}/delete`
  const response = await axios.get(url)
  if (response.data) {
    dispatch(postRemoved({ _id: postId }))
  }
}

export const createTopicPost = async ({
  title,
  banner,
  content,
  serverId,
  topicId,
  tags,
  attachments,
}: {
  title: string
  banner?: string
  content: BaseEditor & ReactEditor & HistoryEditor
  serverId: string
  topicId: string
  tags?: string[]
  attachments?: string[]
}) => {
  const url = `http://localhost:5000/servers/${serverId}/${topicId}/posts`
  try {
    const response = await axios.post(url, {
      title: title,
      ...(banner && { banner: banner }),
      content: content,
      ...(tags && { tags: tags }),
      ...(attachments && { attachments: attachments }),
    })
    if (response.data) {
      console.log(response.data)
      return response.data
    }
  } catch (err) {
    console.log(err)
  }
}

export const createServer = async (
  server: {
    name: string
    avatar?: string
  },
  dispatch: Dispatch,
) => {
  const url = "http://localhost:5000/servers/create"
  try {
    const response = await axios.post(url, server)
    if (response.data) {
      dispatch(serverAdded(response.data.server))
      dispatch(memberAdded(response.data.member))
      dispatch(channelAdded(response.data.channel))
      dispatch(roleAdded(response.data.role))
      dispatch(topicAdded(response.data.topic))
      return response.data
    }
  } catch (err) {
    console.log(err)
  }
}

export const getSearchRecommendations = async (
  serverId: string,
  input: string,
  dispatch: Dispatch,
) => {
  const url = "http://localhost:5000/servers/" + serverId + "/members/search"
  try {
    const response = await axios.get(url + "?q=" + input)
    if (response.data) {
      console.log(response.data)
      dispatch(membersAdded(response.data))
      return response.data
    }
  } catch (err) {
    console.log(err)
    return err
  }
}
