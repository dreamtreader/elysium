import { createSlice, createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { Role, roleState } from "../../../types"

const initialState: roleState = {}

export const roleReducer = createSlice({
  name: "roles",
  initialState,
  reducers: {
    loggedOut(state, action) {
      return initialState
    },
    roleAdded(state, action) {
      const role = action.payload
      state[role._id] = role
    },

    rolesAdded(state, action) {
      const roles = action.payload
      roles.forEach((role: Role) => {
        state[role._id] = role
      })
    },

    roleChanged(state, action) {
      const role = action.payload
      const prevRole = state[role._id]

      state[role._id] = { ...prevRole, ...role }
    },
    roleRemoved(state, action) {
      const role = action.payload
      delete state[role._id]
    },

    rolesRemoved(state, action) {
      const roles = action.payload
      roles.forEach((roleId: string) => {
        delete state[roleId]
      })
    },
  },
})

export const getRoleById = (roleId: string) =>
  createSelector(
    (state: RootState) => state.roles,
    (roles) => roles[roleId],
  )

export const getServerRoles = (serverId: string) =>
  createSelector(
    (state: RootState) => state.roles,
    (roles) =>
      Object.values(roles).filter((role: Role) => role.serverId == serverId),
  )

export const getHighestRole = (memberId: string) =>
  createSelector(
    (state: RootState) => ({ roles: state.roles, members: state.members }),
    ({ roles, members }) => {
      const member = members[memberId]
      if (!member) return null
      const highestRole = member.roleIds.reduce(
        (highestRole, currentRole) =>
          highestRole.position > roles[currentRole].position
            ? highestRole
            : roles[currentRole],
        roles[member.roleIds[0]],
      )
      return highestRole as Role
    },
  )
export const getEveryoneRole = (serverId: string) =>
  createSelector(
    (state: RootState) => state.roles,
    (roles) =>
      Object.values(roles).find(
        (role: Role) => role.serverId == serverId && role.position === 0,
      ),
  )

export const getMemberRoles = (serverId: string, memberRoleIds: string[]) =>
  createSelector(
    (state: RootState) => state.roles,
    (roles) =>
      Object.values(roles).filter(
        (role: Role) =>
          role.serverId == serverId && memberRoleIds.includes(role._id),
      ),
  )

export const {
  loggedOut,
  roleAdded,
  rolesAdded,
  roleChanged,
  roleRemoved,
  rolesRemoved,
} = roleReducer.actions

export default roleReducer.reducer
