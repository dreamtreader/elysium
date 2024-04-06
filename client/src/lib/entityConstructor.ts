import { PermissionTypes, Role } from "../types"

type roleProps = {
  _id?: string
  name?: string
  serverId: string
  position: number
  permissions?: number
  color?: string
  canBeMentioned?: boolean
  displaySeparately?: boolean
}

export const constructRole: (roleProps: roleProps) => Role = ({
  _id = "NEW_ROLE",
  name = "New Role",
  serverId,
  position,
  permissions = PermissionTypes.defaultPermissions,
  color = "#FFFFFF",
  canBeMentioned = false,
  displaySeparately = false,
}: roleProps) => ({
  _id: _id,
  name: name,
  serverId: serverId,
  position: position,
  permissions: permissions,
  color: color,
  canBeMentioned: canBeMentioned,
  displaySeparately: displaySeparately,
})
