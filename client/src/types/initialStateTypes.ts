import {
  Server,
  Channel,
  Topic,
  Member,
  Role,
  SearchParameter,
  partialUser,
  Post,
} from "../types"

export interface chatState {
  fetched: boolean
  activeCategory?: string
  servers: {
    [server_id: string]: Server
  }
  channels: {
    [channel_id: string]: Channel
  }
  users: {
    [user_id: string]: partialUser
  }
  topics: {
    [topic_id: string]: Topic
  }
  posts: {
    [post_id: string]: Post
  }
  postSortField: "createdAt" | "likes" | "views"
}

export interface memberState {
  [key: string]: Member
}

export interface roleState {
  [role_id: string]: Role
}

export interface UIState {
  openModal?: { type: string; entity: string }
  openDropdown?: string
  openSearch?: string
  activeChannel?: string
  activeCategory?: string
  previewedImage: { url: string; uploaded: boolean }
  saveChanges?: string
  openCropper?: {
    src: string
    onCrop?: (url?: string) => any
    aspectRatio: number
  }
  editedMessage?: string
}

export type componentName =
  | "openModal"
  | "openDropdown"
  | "activeChannel"
  | "activeCategory"
  | "previewedImage"
  | "openSearch"
  | "saveChanges"
  | "openCropper"
  | "editedMessage"

export interface typingState {
  [key: string]: { [key: string]: boolean }
}

export interface searchState {
  activeParameter?: SearchParameter
  parameters: {
    from?: { user: partialUser; member: Member }
    in?: Channel
    before?: string
    after?: string
    pinned?: boolean
  }
  input: {
    changed?: boolean
    value: string
  }
}

export interface pingState {
  DMs: {
    [channelId: string]: string[]
  }
  servers: {
    [serverId: string]: {
      [channelId: string]: string[]
    }
  }
}
