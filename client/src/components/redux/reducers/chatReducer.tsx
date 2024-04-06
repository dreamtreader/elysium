import { createSlice, createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import {
  chatState,
  Channel,
  User,
  Topic,
  partialUser,
  Server,
  CHANNEL_IDS,
  DM,
  Message,
  GroupDM,
  fullPost,
} from "../../../types"
import { sortByDate } from "../../../lib/sortFunctions"

const initialState: chatState = {
  fetched: false,
  activeCategory: "",
  servers: {},
  channels: {},
  users: {},
  topics: {},
  posts: {},
  postSortField: "createdAt",
}

export const chatReducer = createSlice({
  name: "chat",
  initialState,
  reducers: {
    chatDataLoaded(state, action) {
      return { ...state, ...action.payload }
    },

    loggedOut(state, action) {
      return initialState
    },
    /// SERVERS

    serverAdded(state, action) {
      state.servers[action.payload._id] = action.payload
    },
    serversAdded(state, action) {
      action.payload.forEach(
        (server: Server) => (state.servers[server._id] = action.payload.server),
      )
    },

    serverChanged(state, action) {
      const server = action.payload
      const prevServer = state.servers[server._id]
      state.servers[server._id] = { ...prevServer, ...server }
    },

    serverRemoved(state, action) {
      delete state.servers[action.payload._id]
    },

    activeTopicChanged(state, action) {
      const { serverId, activeTopic } = action.payload
      state.servers[serverId].activeTopic = activeTopic
    },

    /// CHANNELS

    channelAdded(state, action) {
      const channel = action.payload
      state.channels[channel._id] = {
        avatar:
          "https://res.cloudinary.com/dnpgwek4e/image/upload/v1680872064/avatars/default.png",
        ...channel,
        fetched: false,
        fullyFetched: false,
        messages: [],
      }
    },

    channelsAdded(state, action) {
      action.payload.forEach((channel) => {
        state.channels[channel._id] = {
          avatar:
            "https://res.cloudinary.com/dnpgwek4e/image/upload/v1680872064/avatars/default.png",
          ...channel,
          fetched: false,
          fullyFetched: false,
          messages: [],
        }
      })
    },

    channelChanged(state, action) {
      const channel = action.payload
      const oldChannel = state.channels[channel._id]
      state.channels[channel._id] = {
        ...oldChannel,
        ...channel,
      }
    },

    channelRemoved(state, action) {
      const channel = action.payload
      delete state.channels[channel._id]
      return state
    },

    channelsRemoved(state, action) {
      action.payload.forEach((channel: Channel) => {
        delete state.channels[channel._id]
      })
      return state
    },

    /// TOPICS

    topicAdded(state, action) {
      const topic = action.payload
      state.topics[topic._id] = topic
    },

    topicsAdded(state, action) {
      const topics = action.payload
      topics.forEach((topic: Topic) => {
        state.topics[topic._id] = topic
      })
    },

    topicChanged(state, action) {
      const topic = action.payload
      const oldTopic = state.topics[topic._id]
      state.topics[topic._id] = { ...oldTopic, ...topic }
    },

    topicRemoved(state, action) {
      const topic = action.payload
      delete state.topics[topic._id]
    },

    topicsRemoved(state, action) {
      action.payload.forEach((topic: Topic) => {
        delete state.topics[topic._id]
      })
    },
    /// MESSAGES

    messageHistoryRefreshed(state, action) {
      const channelId = action.payload.channelId
      state.channels[channelId].messages.unshift(...action.payload.messages)
    },

    messagesAdded(state, action) {
      const messages = action.payload
      messages.forEach((message) => {
        state.channels[message.channelId].messages.unshift(message)
      })
    },

    messageAdded(state, action) {
      ///expects a msg of type Message as payload
      const channelId = action.payload.channelId
      state.channels[channelId].messages.push(action.payload)
    },

    messageChanged(state, action) {
      const channelId = action.payload.channelId
      const index = state.channels[channelId]?.messages.findIndex(
        (message) => message._id == action.payload._id,
      )
      if (index) {
        state.channels[channelId].messages[index] = action.payload
      }
      return state
    },

    messageRemoved(state, action) {
      const channelId = action.payload.channelId
      const newMessages = state.channels[channelId]?.messages.filter(
        (message) => message._id !== action.payload._id,
      )
      if (state.channels[channelId]) {
        state.channels[channelId].messages = newMessages
      }
      return state
    },

    /// USERS

    userAdded(state, action) {
      const user = action.payload
      state.users[user._id] = {
        avatar:
          "https://res.cloudinary.com/dnpgwek4e/image/upload/v1680872064/avatars/default.png",
        ...user,
      }
    },

    usersAdded(state, action) {
      const users = action.payload
      users.forEach((user: any) => {
        if (!state.users[user._id])
          state.users[user._id] = {
            avatar:
              "https://res.cloudinary.com/dnpgwek4e/image/upload/v1680872064/avatars/default.png",
            ...user,
          }
      })
    },

    userChanged(state, action) {
      const user = action.payload
      const oldUser = state.users[user._id]
      state.users[user._id] = { ...oldUser, ...user }
      return state
    },

    postAdded(state, action) {
      const post = action.payload
      state.posts[post._id] = post
      return state
    },

    postsAdded(state, action) {
      const posts = action.payload
      posts.forEach((post) => {
        const alreadyFetchedPost = state.posts[post._id] as fullPost
        if (alreadyFetchedPost) {
          if (alreadyFetchedPost.fullyFetched) {
            state.posts[post._id] = {
              ...post,
              fullyFetched: true,
              content: alreadyFetchedPost.content,
            }
          } else state.posts[post._id] = post
        } else state.posts[post._id] = post
      })
      return state
    },

    postChanged(state, action) {
      const post = action.payload
      const oldPost = state.posts[post._id]
      state.posts[post._id] = { ...oldPost, ...post }
      return state
    },

    postRemoved(state, action) {
      const post = action.payload
      delete state.posts[post._id]
      return state
    },

    postsRemoved(state, action) {
      const posts = action.payload
      posts.forEach((post) => {
        delete state.posts[post._id]
      })
      return state
    },

    postSortFieldChanged(state, action) {
      state.postSortField = action.payload
      return state
    },

    /// UI

    activeChannelChanged(state, action) {
      state.servers[action.payload.serverId].activeChannel =
        action.payload.channelId
    },
    activeCategoryChanged(state, action) {
      state.activeCategory = action.payload
    },
  },
})

export const getUserById = (id: string | boolean) =>
  createSelector(
    (state: RootState) => ({ users: state.chat.users, user: state.user }),
    ({
      users,
      user,
    }: {
      users: { [key: string]: partialUser }
      user: User
    }) => {
      if (user._id === id) return user
      return users[typeof id == "string" ? id : ""]
    },
  )

export const getUsersByIds = (ids: string[]) =>
  createSelector(
    (state: RootState) => ({ users: state.chat.users, selfUser: state.user }),
    ({
      users,
      selfUser,
    }: {
      users: { [key: string]: partialUser }
      selfUser: User
    }) => [
      ...Object.values(users).filter(
        (user) => ids.includes(user._id) && user._id !== selfUser._id,
      ),
      ...(ids.includes(selfUser._id) ? [selfUser] : []),
    ],
  )

export const filterUsers = (input: string) =>
  createSelector(
    (state: RootState) => ({
      users: state.chat.users,
      user: state.user,
    }),
    ({
      users,
      user,
    }: {
      users: { [key: string]: partialUser }
      user: User
    }) => {
      const filteredUsers = Object.values(users)
      if (!users[user._id]) filteredUsers.push(user)

      return filteredUsers.filter((user) => {
        const expr = new RegExp("^" + input, "i")
        return expr.test(user.username) || expr.test(user.displayName)
      })
    },
  )

export const getServerById = (id: string) =>
  createSelector(
    (state: RootState) => state.chat.servers,
    (servers: any) => servers[id],
  )

export const getChannelById = (id: string | boolean) =>
  createSelector(
    (state: RootState) => state.chat.channels,
    (channels: any) => channels[typeof id == "string" ? id : ""],
  )

export const getTopicById = (id: string | boolean) =>
  createSelector(
    (state: RootState) => state.chat.topics,
    (topics: any) => topics[typeof id == "string" ? id : ""],
  )

export const getMessageById = (messageId: string, channelId: string) =>
  createSelector(
    (state: RootState) => state.chat.channels,
    (channels: any) => channels[channelId]?.messages ?? null,
    (messages: any) => messages[messageId] ?? null,
  )

export const getServerChannels = (serverId: string) =>
  createSelector(
    (state: RootState) => state.chat.channels,
    (channels: { [key: string]: Channel }) =>
      Object.values(channels).filter(
        (channel: Channel) => channel.serverId == serverId,
      ),
  )

export const getTopicChannels = (topicId: string) =>
  createSelector(
    (state: RootState) => state.chat.channels,
    (channels: { [key: string]: Channel }) =>
      Object.values(channels).filter(
        (channel: Channel) => channel.topicId == topicId,
      ),
  )

export const getServerTopics = (serverId: string) =>
  createSelector(
    (state: RootState) => state.chat.topics,
    (topics: { [key: string]: Topic }) =>
      Object.values(topics).filter((topic: any) => topic.serverId == serverId),
  )

export const filterChannels = (serverId: string, input: string) =>
  createSelector(
    (state: RootState) => state.chat.channels,
    (channels: { [id: string]: Channel }) =>
      Object.values(channels).filter((channel) => {
        const expr = new RegExp("^" + input, "i")
        return expr.test(channel.name) && channel.serverId == serverId
      }),
  )

export const getDMParticipants = (channelId: string) =>
  createSelector(
    (state: RootState) => ({
      users: state.chat.users,
      channel: state.chat.channels[channelId] as DM,
    }),
    ({ users, channel }) =>
      Object.values(users).filter((user) =>
        channel.recipients.includes(user._id),
      ),
  )

export const getServerMessages = (serverId: string) =>
  createSelector(
    (state: RootState) => state.chat.channels,
    (channels: { [key: string]: Channel }) => {
      return Object.values(channels)
        .filter(
          (channel) =>
            channel.serverId === serverId && channel.messages.length !== 0,
        )
        .reduce((accumulator: Message[], currentChannel: Channel) => {
          accumulator = [...accumulator, ...currentChannel.messages]
          return accumulator
        }, [])
        .sort(sortByDate)
    },
  )

export const getDMs = createSelector(
  (state: RootState) => state.chat.channels,
  (channels: { [id: string]: Channel }) =>
    Object.values(channels).filter(
      (channel) => channel.type === CHANNEL_IDS.DM,
    ) as DM[],
)

export const getConversations = createSelector(
  (state: RootState) => state.chat.channels,
  (channels: { [id: string]: Channel }) =>
    Object.values(channels).filter(
      (channel) =>
        channel.type === CHANNEL_IDS.DM ||
        channel.type === CHANNEL_IDS.GROUP_DM,
    ) as DM[],
)

export const getPostById = (postId: string) =>
  createSelector(
    (state: RootState) => state.chat.posts,
    (posts) => posts[postId] as fullPost,
  )

export const sortPosts = (postSortField) => (a, b) =>
  a[postSortField] > b[postSortField]
    ? 1
    : a[postSortField] == b[postSortField]
    ? a.title > b.title
      ? 1
      : -1
    : 1

export const filterPosts = (input: string, topicId: string) =>
  createSelector(
    (state: RootState) => ({
      posts: state.chat.posts,
      postSortField: state.chat.postSortField,
    }),
    ({ posts, postSortField }) =>
      Object.values(posts)
        .filter((post) => {
          if (post.topicId != topicId) return false

          const regExp = new RegExp(input)
          const foundTag = post.tags.find((tag) => regExp.test(tag))
          return (
            regExp.test(post.title) || regExp.test(post.description) || foundTag
          )
        })
        .sort(sortPosts(postSortField)),
  )

export const {
  chatDataLoaded,
  loggedOut,
  serverAdded,
  serversAdded,
  serverChanged,
  serverRemoved,
  activeChannelChanged,
  activeCategoryChanged,
  activeTopicChanged,
  channelAdded,
  channelsAdded,
  channelRemoved,
  channelsRemoved,
  channelChanged,
  usersAdded,
  userAdded,
  userChanged,
  messageAdded,
  messagesAdded,
  messageChanged,
  messageHistoryRefreshed,
  messageRemoved,
  topicAdded,
  topicsAdded,
  topicChanged,
  topicRemoved,
  topicsRemoved,
  postAdded,
  postsAdded,
  postChanged,
  postRemoved,
  postsRemoved,
  postSortFieldChanged,
} = chatReducer.actions

export default chatReducer.reducer
