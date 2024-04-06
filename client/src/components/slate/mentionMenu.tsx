import { Member, Role, partialUser } from "../../types"
import { createPortal } from "react-dom"
import React from "react"
import { useSelector } from "react-redux"
import { getUserById } from "../redux/reducers/chatReducer"

const MemberItem = ({
  onClick,
  member,
}: {
  onClick?: ({
    id,
    value,
    mentionType,
  }: {
    id: string
    value: string
    mentionType: string
  }) => any
  member: Member
}) => {
  const user = useSelector(getUserById(member.userId))
  return (
    <button
      onClick={(e) => {
        onClick
          ? onClick({ id: user._id, value: user.username, mentionType: "user" })
          : null
      }}
      className="rounded-sm text-left hover:bg-csblue-300 hover:text-cspink-50 w-full p-2 text-csblue-100 font-semibold flex gap-2 items-center"
    >
      <span
        style={{
          backgroundImage: `url(${member.avatar ?? user.avatar})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        className="bg-csblue-300 h-8 aspect-square rounded-full inline-flex"
      />
      <span className="text-cspink-50 text-lg">
        {member.displayName || user.displayName}
      </span>
      <span>@{user.username}</span>
    </button>
  )
}

const UserItem = ({
  onClick,
  user,
}: {
  onClick?: ({
    id,
    value,
    mentionType,
  }: {
    id: string
    value: string
    mentionType: string
  }) => any
  user: partialUser
}) => {
  return (
    <button
      onClick={(e) => {
        onClick
          ? onClick({ id: user._id, value: user.username, mentionType: "user" })
          : null
      }}
      className="rounded-sm text-left hover:bg-csblue-300 hover:text-cspink-50 w-full p-2 text-csblue-100 font-semibold flex gap-2 items-center"
    >
      <span
        style={{
          backgroundImage: `url(${user.avatar})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        className="bg-csblue-200 h-8 aspect-square rounded-full inline-flex"
      />
      <span className="text-cspink-50 text-lg">{user.displayName}</span>
      <span>@{user.username}</span>
    </button>
  )
}

const RoleItem = ({
  onClick,
  role,
}: {
  onClick?: ({
    id,
    value,
    mentionType,
  }: {
    id: string
    value: string
    mentionType: string
  }) => any
  role: Role
}) => {
  return (
    <button
      onClick={(e) => {
        onClick
          ? onClick({ id: role._id, value: role.name, mentionType: "role" })
          : null
      }}
      className="rounded-sm text-left hover:bg-csblue-400 hover:text-cspink-50 w-full p-2 text-csblue-100 font-semibold flex gap-2 items-center"
    >
      <span
        style={{ backgroundColor: `${role.color}` }}
        className=" h-8 aspect-square rounded-full inline-flex"
      />
      <span className="text-cspink-50 text-lg">{role.name}</span>
    </button>
  )
}

const MentionMenu = ({
  mentions,
  containerRef,
  onClick,
}: {
  mentions: {
    users?: partialUser[]
    members?: Member[]
    roles?: Role[]
  }
  containerRef?: React.RefObject<HTMLElement>
  index: number
  onClick?: ({
    id,
    value,
    mentionType,
  }: {
    id: string
    value: string
    mentionType: string
  }) => any
}) => {
  return createPortal(
    <div
      className="rounded-md shadow-md bg-csblue-400 p-2 divide-b-[1px] divide-csblue-200"
      style={{
        top:
          containerRef?.current?.getBoundingClientRect().top +
          (window.scrollY - 10) +
          "px",
        width: containerRef?.current.clientWidth + "px",
        left:
          containerRef?.current?.getBoundingClientRect().left +
          window.scrollX +
          "px",
        position: "absolute",
        transform: "translateY(-100%)",
        zIndex: 1,
      }}
      data-cy="mentions-portal"
    >
      {mentions.users ? (
        <div className="w-full flex flex-col gap-1">
          <h1 className="text-csblue-50 font-semibold">USERS</h1>
          {mentions.users.map((user, i) => (
            <UserItem user={user} onClick={onClick} />
          ))}
        </div>
      ) : null}
      {mentions.members ? (
        <div className="w-full flex flex-col gap-1">
          <h1 className="text-csblue-50 font-semibold">MEMBERS</h1>
          {mentions.members.map((member, i) => (
            <MemberItem member={member} onClick={onClick} />
          ))}
        </div>
      ) : null}
      {mentions.roles ? (
        <div className="w-full flex flex-col gap-1">
          <h1 className="text-csblue-50 font-semibold">ROLES</h1>
          {mentions.roles.map((role, i) => (
            <RoleItem role={role} onClick={onClick} />
          ))}
        </div>
      ) : null}
    </div>,
    document.getElementById("root") || document.body,
  )
}

export default MentionMenu
