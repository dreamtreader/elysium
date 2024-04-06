export const PermissionTypes = {
  General: {
    CREATE_INVITE: 1 << 0,
    KICK_MEMBER: 1 << 1,
    BAN_MEMBER: 1 << 2,
    ADMINISTRATOR: 1 << 3,
    MANAGE_CHANNEL: 1 << 4,
    MANAGE_SERVER: 1 << 5,
    VIEW_AUDIT_LOG: 1 << 6,
    VIEW_CHANNEL: 1 << 7,
    CHANGE_DISPLAYNAME: 1 << 8,
    MANAGE_DISPLAYNAME: 1 << 9,
    MANAGE_ROLE: 1 << 10,
  },
  Text: {
    ADD_REACTION: 1 << 11,
    EMBED_LINKS: 1 << 12,
    ATTACH_FILE: 1 << 13,
    READ_MESSAGE: 1 << 14,
    MENTION_EVERYONE: 1 << 15,
    MANAGE_MESSAGE: 1 << 16,
    SEND_MESSAGE: 1 << 17,
  },

  Blog: {
    CREATE_POST: 1 << 18,
    VIEW_POST: 1 << 19,
  },

  All: {
    CREATE_INVITE: 1 << 0,
    KICK_MEMBER: 1 << 1,
    BAN_MEMBER: 1 << 2,
    ADMINISTRATOR: 1 << 3,
    MANAGE_CHANNEL: 1 << 4,
    MANAGE_SERVER: 1 << 5,
    VIEW_AUDIT_LOG: 1 << 6,
    VIEW_CHANNEL: 1 << 7,
    CHANGE_DISPLAYNAME: 1 << 8,
    MANAGE_DISPLAYNAME: 1 << 9,
    MANAGE_ROLE: 1 << 10,
    ADD_REACTION: 1 << 11,
    EMBED_LINKS: 1 << 12,
    ATTACH_FILE: 1 << 13,
    READ_MESSAGE: 1 << 14,
    MENTION_EVERYONE: 1 << 15,
    MANAGE_MESSAGE: 1 << 16,
    SEND_MESSAGE: 1 << 17,

    CREATE_POSTS: 1 << 18,
    VIEW_POSTS: 1 << 19,
  },

  canAddOverwrite: {
    MAANGE_CHANNEL: true,
    VIEW_CHANNEL: true,
    ADD_REACTION: true,
    ATTACH_FILE: true,
    READ_MESSAGE: true,
    MANAGE_MESSAGE: true,
    SEND_MESSAGE: true,
  },
};

export const defaultPermissions =
  PermissionTypes.All.CREATE_INVITE |
  PermissionTypes.All.VIEW_CHANNEL |
  PermissionTypes.All.ADD_REACTION |
  PermissionTypes.All.ATTACH_FILE |
  PermissionTypes.All.READ_MESSAGE |
  PermissionTypes.All.SEND_MESSAGE |
  PermissionTypes.All.CHANGE_DISPLAYNAME |
  PermissionTypes.All.EMBED_LINKS;

export const CHANNEL_IDS = {
  TEXT: 0,
  DM: 1,
  VOICE: 2,
  GROUP_DM: 3,
  CATEGORY: 4,
};

export const OVERWRITE_IDS = {
  ROLE: 0,
  MEMBER: 1,
};
