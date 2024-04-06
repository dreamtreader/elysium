import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit"
import { User } from "../../../types"
import { RootState } from "../store"

const initialState: User = {
  email: "",
  password: "",
  isSignedIn: false,
  _id: "",
  displayName: "",
  createdAt: "",
  avatar: "",
  status: "",
  isOnline: false,
  username: "",
  attemptedLogin: false,
  lastReadMessageIds: {},
  friendRequests: [],
  friends: [],
}

export const userReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    attemptedToLogin(state, action: PayloadAction<boolean>) {
      state.attemptedLogin = action.payload
    },
    loggedOut(state, action) {
      return initialState
    },
    selfUserChanged(state, action) {
      Object.entries(action.payload).forEach(([key, value]) => {
        state[key] = value
      })
    },
    setLastReadMessage(
      state,
      action: PayloadAction<{ messageId: string; channelId: string }>,
    ) {
      const { channelId, messageId } = action.payload
      state.lastReadMessageIds[channelId] = messageId
      return state
    },
    signIn(state, action: PayloadAction<{}>) {
      return {
        ...state,
        avatar:
          "https://res.cloudinary.com/dnpgwek4e/image/upload/v1680872064/avatars/default.png",
        ...action.payload,
        isSignedIn: true,
      }
    },
  },
})

export const getFriends = createSelector(
  (state: RootState) => ({ user: state.user, users: state.chat.users }),
  ({ user, users }) =>
    Object.values(users).filter((friend) => user.friends.includes(friend._id)),
)
export const getReceivedFriendRequests = createSelector(
  (state: RootState) => state.user,
  (user) =>
    user.friendRequests.filter(
      (friendRequest) => friendRequest.receiver === user._id,
    ),
)

export const getTransmittedFriendRequests = createSelector(
  (state: RootState) => state.user,
  (user) =>
    user.friendRequests.filter(
      (friendRequest) => friendRequest.transmitter === user._id,
    ),
)

export const {
  signIn,
  loggedOut,
  selfUserChanged,
  attemptedToLogin,
  setLastReadMessage,
} = userReducer.actions

export default userReducer.reducer
