import { createSlice, createSelector } from "@reduxjs/toolkit"
import { typingState } from "../../../types"

const initialState: typingState = {}

export const typingReducer = createSlice({
  name: "typing",
  initialState,
  reducers: {
    typingAdded(state, action) {
      const channelId = action.payload.channelId
      const memberId = action.payload.memberId
      state[channelId][memberId] = true
    },
    typingRemoved(state, action) {
      const channelId = action.payload.channelId
      const memberId = action.payload.memberId
      delete state[channelId][memberId]
    },
  },
})

export const { typingAdded, typingRemoved } = typingReducer.actions
export default typingReducer.reducer
