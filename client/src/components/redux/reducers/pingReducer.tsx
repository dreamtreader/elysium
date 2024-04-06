import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { Channel, CHANNEL_IDS, pingState } from "../../../types"

const initialState: pingState = { DMs: {}, servers: {} }

const pingReducer = createSlice({
  name: "pings",
  initialState,
  reducers: {
    loggedOut(state, action) {
      return initialState
    },
    pingsInitialized(state, action) {
      state.DMs = action.payload.DMs
      state.servers = action.payload.servers
    },
    pingAdded(
      state,
      action: PayloadAction<{ messageId: string; channel: Channel }>,
    ) {
      const { messageId, channel } = action.payload
      if (channel.type == CHANNEL_IDS.TEXT)
        state.servers[channel.serverId][channel._id] = [
          ...state.servers[channel.serverId][channel._id],
          messageId,
        ]
      else state.DMs[channel._id] = [...state.DMs[channel._id], messageId]
    },
    channelPingsAdded(
      state,
      action: PayloadAction<{ messageIds: string[]; channel: Channel }>,
    ) {
      const { channel, messageIds } = action.payload
      if (channel.type == CHANNEL_IDS.TEXT)
        state.servers[channel.serverId][channel._id] = messageIds
      else state.DMs[channel._id] = messageIds
    },
    channelPingsRemoved(state, action: PayloadAction<{ channel: Channel }>) {
      const { channel } = action.payload
      if (channel.type == CHANNEL_IDS.TEXT)
        delete state.servers[channel.serverId][channel._id]
      else delete state.DMs[channel._id]
    },
  },
})

export const getServerPings = (serverId: string) =>
  createSelector(
    (state: RootState) => state.pings,
    (pings) =>
      Object.keys(pings.servers[serverId]).reduce(
        (accumulatedPings, currentChannel) => {
          accumulatedPings.push(...pings.servers[serverId][currentChannel])
          return accumulatedPings
        },
        [],
      ),
  )

export const getServerChannelPings = (serverId: string, channelId: string) =>
  createSelector(
    (state: RootState) => state.pings,
    (pings) => pings.servers?.[serverId]?.[channelId],
  )
export const getDMPings = (channelId: string) =>
  createSelector(
    (state: RootState) => state.pings,
    (pings) => pings.DMs[channelId],
  )

export const getTotalServerPings = createSelector(
  (state: RootState) => state.pings,
  (pings) =>
    Object.keys(pings.servers).reduce((accumulatedPings, currentServer) => {
      const serverPings = Object.values(pings.servers[currentServer]).reduce(
        (srvPings, currentChannel) => {
          srvPings.push(...currentChannel)
          return srvPings
        },
        [],
      )
      accumulatedPings.push(...serverPings)
      return accumulatedPings
    }, []),
)

export const getTopicPings = (topicId: string, serverId: string) =>
  createSelector(
    (state: RootState) => ({
      pings: state.pings,
      channels: state.chat.channels,
    }),
    ({ pings, channels }) => {
      const topicChannels = Object.values(channels).filter(
        (channel: Channel) => channel.topicId == topicId,
      )

      if (topicChannels)
        return topicChannels.reduce((accumulatedPings, currentChannel) => {
          accumulatedPings.push(
            ...(pings.servers[serverId]?.[currentChannel._id] ?? []),
          )
          return accumulatedPings
        }, [])
      else return []
    },
  )

export const getTotalDMPings = createSelector(
  (state: RootState) => state.pings,
  (pings) =>
    Object.keys(pings.DMs).reduce((accumulatedPings, currentChannel) => {
      accumulatedPings.push(...pings.DMs[currentChannel])
      return accumulatedPings
    }, []),
)

export const { loggedOut, pingsInitialized, pingAdded, channelPingsRemoved } =
  pingReducer.actions

export default pingReducer.reducer
