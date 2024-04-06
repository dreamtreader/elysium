export interface User {
  isSignedIn: boolean
  _id: string
  displayName: string
  email: string
  password: string
  avatar?: string
  banner?: string
  status?: string
  createdAt: string
  username: string
  isOnline: boolean
  attemptedLogin: boolean
  friendRequests: { transmitter: string; receiver: string }[]
  lastReadMessageIds: { [key: string]: string }
  friends: string[]
}

export interface partialUser {
  _id: string
  displayName: string
  avatar?: string
  banner?: string
  status?: string
  createdAt: string
  username: string
  isOnline: boolean
}

export interface friendRequest {
  recipient: User
  transmitter: string
}

export interface Reaction {
  emoji: string
  users: Array<string>
}

export interface Topic {
  name: string
  serverId: string
  iconId?: string
  color?: string
  avatar?: string
  _id: string
  permissionOverwrites?: Overwrite[]
}

export interface Message {
  _id: string
  content: string
  attachmentURLs?: Array<string>
  system: boolean
  mentionEveryone: boolean
  mentions: string[]
  mentionedRoles: string[]
  mentionedChannel: string[]
  type: number
  editedAt?: string
  channelId: string
  authorId: string
  createdAt: string
  replyingTo?: string
  reactions?: Array<Reaction>
  deleted?: boolean
}

export interface Member {
  userId: string
  displayName?: string
  username: string
  avatar?: string
  banner?: string
  _id: string
  roleIds: string[]
  serverId: string
  joinedAt: string
  isOnline?: boolean
}

export interface fullMember extends Member {
  displayName: string
  avatar?: string
  isOnline: boolean
}

export interface Invite {
  _id: string
  createdAt: string
  uses: number
  maxUses?: number
  expiresAt?: string
  authorId: string
}

export interface Channel {
  name: string
  type: number
  serverId: string
  _id: string
  description: string
  topicId: string
  messages: Message[]
  fetched: boolean
  fullyFetched: boolean
  permissionOverwrites: Overwrite[]
  lastMessageId?: string
  position: number
}

export const CHANNEL_IDS = {
  TEXT: 0,
  DM: 1,
  VOICE: 2,
  GROUP_DM: 3,
  CATEGORY: 4,
}

export interface DM extends Channel {
  type: 1
  recipients: string[]
}

export interface GroupDM extends Channel {
  type: 3
  recipients: string[]
  avatar?: string
}

export interface Overwrite {
  id: string
  type: 0 | 1
  allow: number
  deny: number
}

export interface Server {
  createdAt: string
  _id: string
  ownerId: string
  name: string
  avatar?: string
  banner?: string
  fetched: boolean
  topicIds: string
  activeTopic: string
  activeChannel: string
}

export interface Role {
  _id: string
  name: string
  permissions: number
  serverId: string
  position: number
  color: string
  hoisted: boolean
  mentionable: boolean
}

export interface Post {
  _id: string
  title: string
  description: string
  banner?: string
  tags: string[]
  attachments: string[]
  serverId: string
  topicId: string
  authorId: string
  likes: number
  views: number
  fullyFetched: boolean
}

export interface fullPost extends Post {
  content: string
}

export type SearchParameter = "from" | "before" | "after" | "in" | "pinned"

/// UI

export interface MenuItem {
  condition?: Boolean
  danger?: boolean
  content: string
  icon?: React.ReactNode
  onClick?: (e: any) => any
}
