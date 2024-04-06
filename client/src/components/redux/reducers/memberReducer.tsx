import { createSlice, createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import {
  Member,
  Role,
  User,
  fullMember,
  memberState,
  partialUser,
} from "../../../types"
import { getUserById } from "./chatReducer"
const initialState: memberState = {}

export const memberReducer = createSlice({
  name: "members",
  initialState,
  reducers: {
    loggedOut(state, action) {
      return initialState
    },
    membersAdded(state, action) {
      action.payload.forEach((member: Member) => {
        state[member._id] = member
      })
    },
    memberAdded(state, action) {
      const member = action.payload
      state[member._id] = member
    },

    memberChanged(state, action) {
      const member = action.payload
      state[member._id] = member
    },

    memberRemoved(state, action) {
      delete state[action.payload._id]
    },

    membersRemoved(state, action) {
      action.payload.forEach((member: Member) => delete state[member._id])
    },
  },
})

export const getServerMembers = (serverId: string) =>
  createSelector(
    (state: RootState) => ({
      members: state.members,
      users: state.chat.users,
      user: state.user,
    }),
    ({ members, users, user }) =>
      Object.values(members)
        .filter((member: Member) => member.serverId === serverId)
        .map((member: Member) => ({
          ...(user._id === member.userId ? { ...user } : users[member.userId]),
          ...member,
        })),
  )

export const getSelfAsMember = (serverId: string) =>
  createSelector(
    (state: RootState) => ({
      members: state.members,
      user: state.user,
    }),
    ({ members, user }) => ({
      ...user,
      ...Object.values(members).find((member) => member.userId == user._id),
    }),
  )

export const getMembersByIds = (memberIds: string[]) =>
  createSelector(
    (state: RootState) => ({
      members: state.members,
      users: state.chat.users,
      user: state.user,
    }),
    ({
      members,
      users,
      user,
    }: {
      members: { [id: string]: Member }
      users: { [id: string]: partialUser }
      user: User
    }) =>
      memberIds.reduce((accumulatedMembers, currentMember) => {
        if (user._id == members[currentMember].userId) {
          accumulatedMembers[currentMember] = { ...user }
        } else
          accumulatedMembers[currentMember] =
            users[members[currentMember].userId]
        accumulatedMembers[currentMember] = {
          ...accumulatedMembers[currentMember],
          ...members[currentMember],
        }
        return accumulatedMembers
      }, {}),
  )

export const getSelfMembers = createSelector(
  (state: RootState) => ({
    members: state.members,
    users: state.chat.users,
    user: state.user,
  }),
  ({
    members,
    users,
    user,
  }: {
    members: { [id: string]: Member }
    users: { [id: string]: partialUser }
    user: User
  }) =>
    Object.values(members)
      .filter((member) => member.userId == user._id)
      .reduce((accumulatedMembers, currentMember) => {
        if (user._id == currentMember.userId) {
          accumulatedMembers[currentMember._id] = { ...user }
        } else
          accumulatedMembers[currentMember._id] = users[currentMember.userId]
        accumulatedMembers[currentMember._id] = {
          ...accumulatedMembers[currentMember._id],
          ...currentMember,
        }
        return accumulatedMembers as { [key: string]: fullMember }
      }, {}) as { [key: string]: fullMember },
)

export const getMemberById = (memberId: string) =>
  createSelector(
    (state: RootState) => ({
      members: state.members,
      users: state.chat.users,
      user: state.user,
    }),
    ({
      members,
      users,
      user,
    }: {
      members: { [id: string]: Member }
      users: { [id: string]: partialUser }
      user: User
    }) => ({
      ...(user._id == members[memberId].userId
        ? { ...user }
        : users[members[memberId].userId]),
      ...members[memberId],
    }),
  )

export const getMemberByUserId = (userId: string, serverId: string) =>
  createSelector(
    (state: RootState) => ({
      members: state.members,
      users: state.chat.users,
      user: state.user,
    }),
    ({ members, users, user }) => ({
      ...(user._id == userId ? { ...user } : users[userId]),
      ...Object.values(members).find(
        (member) => member.userId === userId && member.serverId == serverId,
      ),
    }),
  )

export const filterMembers = (serverId: string, input: string) =>
  createSelector(
    (state: RootState) => ({ state: state, members: state.members }),
    ({
      members,
      state,
    }: {
      members: { [id: string]: Member }
      state: RootState
    }) =>
      Object.values(members).filter((member) => {
        const expr = new RegExp("^" + input, "i")
        const user = getUserById(member.userId)(state)
        return (
          expr.test(member.displayName || user.displayName) ||
          expr.test(user.username)
        )
      }),
  )

export const {
  loggedOut,
  memberAdded,
  membersAdded,
  memberChanged,
  memberRemoved,
  membersRemoved,
} = memberReducer.actions

export default memberReducer.reducer
