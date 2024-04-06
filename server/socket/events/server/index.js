import { addServerChannel } from "./addChannel.js";
import { addMember } from "./addMember.js";
import { addMemberRole } from "./addMemberRole.js";
import { addRole } from "./addRole.js";
import { addTopic } from "./addTopic.js";
import { changeServerChannel } from "./changeServerChannel.js";
import { changeMember } from "./changeMember.js";
import { changeRole } from "./changeRole.js";
import { changeSelfMember } from "./changeSelfMember.js";
import { changeServer } from "./changeServer.js";
import { changeTopic } from "./changeTopic.js";
import { removeChannel } from "./removeChannel.js";
import { removeMember } from "./removeMember.js";
import { removeMemberRole } from "./removeMemberRole.js";
import { removeRole } from "./removeRole.js";
import { removeServer } from "./removeServer.js";
import { removeTopic } from "./removeTopic.js";
import { addInvite } from "./addInvite.js";
import { changeServerChannelPosition } from "./changeServerChannelPosition.js";

export const serverEvents = {
  addServerChannel: new addServerChannel(),
  addMember: new addMember(),
  addMemberRole: new addMemberRole(),
  addRole: new addRole(),
  addTopic: new addTopic(),
  addInvite: new addInvite(),
  changeServerChannel: new changeServerChannel(),
  changeMember: new changeMember(),
  changeRole: new changeRole(),
  changeSelfMember: new changeSelfMember(),
  changeServer: new changeServer(),
  changeTopic: new changeTopic(),
  removeChannel: new removeChannel(),
  removeMember: new removeMember(),
  removeMemberRole: new removeMemberRole(),
  removeRole: new removeRole(),
  removeServer: new removeServer(),
  removeTopic: new removeTopic(),
  changeServerChannelPosition: new changeServerChannelPosition(),
};
