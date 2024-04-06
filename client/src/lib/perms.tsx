import { RootState } from "../components/redux/store"
import {
  getServerRoles,
  getMemberRoles,
  getEveryoneRole,
  getRoleById,
} from "../components/redux/reducers/roleReducer"
import {
  getServerById,
  getChannelById,
  getUserById,
  getTopicById,
} from "../components/redux/reducers/chatReducer"
import { Overwrite, PermissionTypes, Member, Role } from "../types"
import {
  getSelfAsMember,
  getMemberById,
} from "../components/redux/reducers/memberReducer"

export default class PermService {
  public readonly PermDescriptions = {
    General: {
      CREATE_INVITE: {
        name: "CREATE INVITATIONS",
        description:
          "Allows member to create invitations that allow users to enter the server.",
      },
      KICK_MEMBER: {
        name: "KICK MEMBERS",
        description:
          "Allows member to kick other members. Unable to kick members of higher roles.",
      },
      BAN_MEMBER: {
        name: "BAN MEMBERS",
        description:
          "Allows member to ban other members. Unable to ban members of higher roles.",
      },
      ADMINISTRATOR: {
        dangerous: true,
        name: "ADMINISTRATOR",
        description:
          "Inherently grants all permissions to the member. Do not give this permission carelessly.",
      },
      MANAGE_CHANNEL: {
        name: "MANAGE CHANNELS",
        description:
          "Allows member to edit a channel's display information, as well as its permission overwrites. Can only manage permission overwrites of roles lower than their highest role.",
      },
      MANAGE_SERVER: {
        name: "MANAGE SERVER",
        description: "Allows member to edit the server's display information.",
      },
      VIEW_CHANNEL: {
        name: "VIEW CHANNELS",
        description: "Allows member to view the server's channels.",
      },
    },
    Text: {
      ADD_REACTION: {
        name: "ADD REACTIONS",
        description: "Allows member to add reactions within the server.",
      },
      ATTACH_FILE: {
        name: "ATTACH FILES",
        description: "Allows member to attach files within the server.",
      },
      READ_MESSAGE: {
        name: "READ MESSAGES",
        description: "Allows member to read the server's messages.",
      },
      MANAGE_MESSAGE: {
        name: "MANAGE MESSAGES",
        description:
          "Allows member to delete other members' messages. Unable to delete messages of members with roles higher than theirs.",
      },
      SEND_MESSAGE: {
        name: "SEND MESSAGES",
        description: "Allows member to send messages within the server.",
      },
    },

    Blog: {
      CREATE_POST: {
        name: "CREATE POSTS",
        description: "Allows member to create posts within a server.",
      },
      VIEW_POST: {
        name: "VIEW POSTS",
        description: "Allows member to view posts within a server.",
      },
    },
  }

  constructor(private state: RootState) {}

  private getAllPerms(member: Member, serverId: string) {
    const roles: Role[] = getServerRoles(serverId)(this.state).filter(
      (role: any) => member.roleIds.includes(role._id) || role.position === 0,
    )

    const perms = roles.reduce(
      (accumulatedRoles, currentRole) =>
        currentRole.permissions | accumulatedRoles,
      0,
    )
    return perms
  }

  public canManage(
    permission: PermissionTypes.PermissionName,
    memberId: string,
    serverId: string,
  ) {
    const isHigher = this.memberIsHigher(memberId, serverId)
    const defaultAbility = this.isAbleTo(permission, serverId)

    return isHigher || defaultAbility
  }

  public isHigher(roleId: string, serverId: string) {
    const role = this.getRole(roleId)
    const member = this.getSelfMember(serverId)
    const highestRole = this.getHighestRole(member, serverId)
    const server = this.getServer(serverId)

    return (
      role.position < highestRole.position || server.ownerId === member.userId
    )
  }
  private memberIsHigher(memberId: string, serverId: string) {
    const server = this.getServer(serverId)
    const selfMember = this.getSelfMember(serverId)
    const targetMember = this.getMember(memberId)

    const selfMemberHighestRole = this.getHighestRole(selfMember, serverId)
    const targetMemberHighestRole = this.getHighestRole(targetMember, serverId)

    if (selfMember._id === server.ownerId) return true

    return (
      selfMemberHighestRole.position > targetMemberHighestRole.position &&
      selfMember.userId !== targetMember.userId
    )
  }
  public getHighestRole(member: Member, serverId: string) {
    const roles = getMemberRoles(serverId, member.roleIds)(this.state) ?? []

    const getHigherRole = (currentMaxRole: Role, newRole: Role) =>
      currentMaxRole.position > newRole.position ? currentMaxRole : newRole

    /*return roles.reduce((accumulator: Role, newRole: Role) =>
      getHigherRole(accumulator, newRole),
    )*/
    return roles.reduce(getHigherRole, this.getEveryoneRole(serverId))
  }
  /**public isAbleToInChannel(
    permission: PermissionTypes.PermissionName,
    serverId: string,
    channelId: string,
  ) {
    const server = this.getServer(serverId)
    const channel = this.getChannel(channelId)
    const member = this.getSelfMember(serverId)
    const overrides = channel.overrides?.filter(
      (override: Override) => member.roles.includes(override.roleId) ?? [],
    )
    const accumulatedAllowPermissions = overrides.reduce(
      (accumulation: number, currentOverride: Override) =>
        accumulation | currentOverride.allow,
      0,
    )
    const accumulatedDenyPermissions = overrides.reduce(
      (accumulation: number, currentOverride: Override) =>
        accumulation | currentOverride.deny,
      0,
    )
    const perm = PermissionTypes.All[permission]

    const defaultAbility = this.isAbleTo(permission, serverId)

    const allowedByOverride = this.ownsPerm(
      perm as number,
      accumulatedAllowPermissions,
    )
    const deniedByOverride = this.ownsPerm(
      perm as number,
      accumulatedDenyPermissions,
    )

    const allPerms = this.getAllPerms(member, serverId)

    const admin =
      member._id == server.owner ||
      this.ownsPerm(PermissionTypes.All["ADMINISTRATOR"] as number, allPerms)

    return admin || (defaultAbility && !deniedByOverride) || allowedByOverride
  }**/

  public isAbleToInChannel(
    permission: PermissionTypes.PermissionName,
    serverId: string,
    channelId: string,
  ) {
    if (!serverId || !channelId) return false

    const server = this.getServer(serverId)
    const channel = this.getChannel(channelId)
    const member = this.getSelfMember(serverId)
    const overwrites = channel.permissionOverwrites?.filter(
      (overwrite: Overwrite) => member.roleIds.includes(overwrite.id) ?? [],
    )
    const accumulatedAllowPermissions = overwrites.reduce(
      (accumulation: number, currentOverride: Overwrite) =>
        accumulation | currentOverride.allow,
      0,
    )
    const accumulatedDenyPermissions = overwrites.reduce(
      (accumulation: number, currentOverride: Overwrite) =>
        accumulation | currentOverride.deny,
      0,
    )
    const perm = PermissionTypes.All[permission]

    var allPerms = this.getAllPerms(member, serverId)

    allPerms |= accumulatedAllowPermissions
    allPerms &= ~accumulatedDenyPermissions

    const allowed = this.ownsPerm(perm as number, allPerms)

    const admin =
      member._id == server.ownerId ||
      this.ownsPerm(PermissionTypes.All["ADMINISTRATOR"] as number, allPerms)

    return admin || allowed
  }

  public isAbleToInTopic(
    permission: PermissionTypes.PermissionName,
    serverId: string,
    topicId: string,
  ) {
    if (!serverId || !topicId) return false

    const server = this.getServer(serverId)
    const topic = this.getTopic(topicId)
    const member = this.getSelfMember(serverId)
    const overwrites =
      topic?.permissionOverwrites?.filter(
        (overwrite: Overwrite) => member.roleIds.includes(overwrite.id) ?? [],
      ) ?? []
    const accumulatedAllowPermissions = overwrites.reduce(
      (accumulation: number, currentOverride: Overwrite) =>
        accumulation | currentOverride.allow,
      0,
    )
    const accumulatedDenyPermissions = overwrites.reduce(
      (accumulation: number, currentOverride: Overwrite) =>
        accumulation | currentOverride.deny,
      0,
    )
    const perm = PermissionTypes.All[permission]

    var allPerms = this.getAllPerms(member, serverId)

    allPerms |= accumulatedAllowPermissions
    allPerms &= ~accumulatedDenyPermissions

    const allowed = this.ownsPerm(perm as number, allPerms)

    const admin =
      member._id == server.ownerId ||
      this.ownsPerm(PermissionTypes.All["ADMINISTRATOR"] as number, allPerms)

    return admin || allowed
  }

  public isAbleTo(
    permission: PermissionTypes.PermissionName,
    serverId: string,
  ): Boolean {
    if (!serverId) return false
    const server = this.getServer(serverId)
    const member = this.getSelfMember(serverId)
    const user = this.getUserFromMember(member)

    const allPerms = this.getAllPerms(member, serverId)
    return (
      user._id === server.ownerId ||
      this.ownsPerm(PermissionTypes.All[permission] as number, allPerms)
    )
  }
  private ownsPerm(permission: number, totalPerms: number): Boolean {
    return (
      Boolean(permission & totalPerms) ||
      Boolean(permission & (PermissionTypes.General.ADMINISTRATOR as number))
    )
  }

  private getChannel(channelId: string) {
    const channel = getChannelById(channelId)(this.state)
    if (!channel) throw "Channel not found"
    return channel
  }
  private getUserFromMember(member: Member) {
    const user = getUserById(member.userId)(this.state)
    if (!user) throw "User not found"
    return user
  }

  private getServer(serverId: string) {
    const server = getServerById(serverId)(this.state)
    return server
  }
  private getSelfMember(serverId: string) {
    const member = getSelfAsMember(serverId)(this.state)
    if (!member) throw "Member not found"
    return member
  }
  private getMember(memberId: string) {
    const member = getMemberById(memberId)(this.state)
    if (!member) throw "Member not found"
    return member
  }
  private getRole(roleId: string) {
    const role = getRoleById(roleId)(this.state)
    if (!role) throw "Role not found"
    return role
  }
  private getTopic(topicId: string) {
    const topic = getTopicById(topicId)(this.state)
    return topic
  }
  private getEveryoneRole(serverId: string) {
    const everyoneRole = getEveryoneRole(serverId)(this.state)
    return everyoneRole
  }
}
