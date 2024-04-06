import { Member, fullMember, partialUser } from "../../../types"
import { useState } from "react"
import MemberMenu from "../../contextualMenus/member"
import UserIcon from "../../userIcon"
import { useSelector } from "react-redux"
import {
  getHighestRole,
  getServerRoles,
} from "../../redux/reducers/roleReducer"
import PermService from "../../../lib/perms"
import { store } from "../../redux/store"
import RoleSelector from "../../menus/roleSelector"
import { socket } from "../../../socket/socketInitializer"
import { sortByPosition } from "../../../lib/sortFunctions"

export const DataSection = ({
  firstRow,
  secondRow,
}: {
  firstRow: string
  secondRow: string | JSX.Element
}) => {
  return (
    <div className="flex flex-col p-2">
      <h1 className="text-cspink-50 font-extrabold">{firstRow}</h1>
      <p className="text-csblue-50">{secondRow}</p>
    </div>
  )
}

const setOpacity = (hex, alpha) =>
  `${hex}${Math.floor(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`

export const MemberRoleList = ({ member }: { member: fullMember }) => {
  const roles = useSelector(getServerRoles(member.serverId))
  const memberRoles = roles.filter((role) => member.roleIds.includes(role._id))
  const state = store.getState()
  const perms = new PermService(state)

  const conditions = [
    memberRoles.length,
    perms.canManage("MANAGE_ROLE", member._id, member.serverId),
  ]

  return conditions[0] || conditions[1] ? (
    <div className="flex flex-col p-2 gap-2">
      <h1 className="text-cspink-50 font-extrabold ">ROLES</h1>

      {conditions[0] ? (
        <ul className="flex gap-2">
          {memberRoles.sort(sortByPosition).map((role) => (
            <li
              style={{
                backgroundColor: setOpacity(role.color, 0.2),
                color: role.color,
              }}
              className={`p-1 rounded inline-flex items-center gap-1`}
            >
              <span
                style={{ backgroundColor: role.color }}
                className={`w-3 h-3 flex items-center justify-center rounded-full hover:text-cspink-50`}
              >
                {conditions[1] ? (
                  <i
                    onClick={(e) =>
                      socket.emit("memberRoleRemoved", {
                        roleId: role._id,
                        memberId: member._id,
                        serverId: member.serverId,
                      })
                    }
                    className="bi bi-x flex items-center justify-center cursor-pointer"
                  ></i>
                ) : null}
              </span>
              {role.name}
            </li>
          ))}
        </ul>
      ) : null}
      {conditions[1] ? (
        <span className="text-cspink-50">
          <RoleSelector
            onSelect={(_id: string) => {
              socket.emit("memberRoleAdded", {
                roleId: _id,
                memberId: member._id,
                serverId: member.serverId,
              })
            }}
            roles={roles.filter((role) => !member.roleIds.includes(role._id))}
          >
            <button className="rounded-full flex items-center bg-cspink-50/[0.2]">
              <i className="bi bi-plus"></i>
            </button>
          </RoleSelector>
        </span>
      ) : null}
    </div>
  ) : null
}

export const Participant = ({
  member,
  user,
}: {
  member?: fullMember
  user: partialUser
}) => {
  const [open, setOpen] = useState(false)
  const [contextualOpen, setContextualOpen] = useState(false)
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })

  const highestRole = useSelector(getHighestRole(member._id))
  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation()
          if (open == false) {
            document.body.addEventListener(
              "click",
              (e) => {
                document.body.style.cursor = "auto"
                setOpen(false)
              },
              { once: true },
            )
            setOpen(!open)
          }
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setCoordinates({ x: e.pageX, y: e.pageY })
          setContextualOpen(true)
          window.addEventListener("click", (e) => {
            e.stopPropagation()
            setContextualOpen(false)
            window.removeEventListener("click", () => {})
          })
        }}
        className={`max-w-[20rem] ${
          !open
            ? "cursor-pointer h-[3rem] max-h-[4rem] hover:bg-csblue-100 hover:text-csblue-50 bg-csblue-200"
            : "max-h-[35rem] bg-csblue-300"
        } relative transition-all ease-out duration-300 gap-2 text-lg text-csblue-100 rounded-md shrink-0`}
      >
        {open ? (
          <div
            style={{
              backgroundImage: `url(${member.banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="z-1 aspect-video w-full rounded-t-md w-full bg-csblue-500"
          />
        ) : null}
        <section
          className={`z-2 absolute ${
            open ? "left-2 top-2" : "h-full left-0 top-0"
          } ${
            open || member.isOnline ? `opacity-100` : `opacity-20`
          } transition-all ease-out duration-300 p-2 rounded-md backdrop-blur-sm
          flex items-center gap-2 transition-all ease-out ${
            open ? "bg-csblue-700 bg-opacity-40" : null
          }`}
        >
          <UserIcon user={member} className="w-8 h-8 bg-csblue-100" />
          <div className="relative grid grid-cols-1 justify-center overflow-hidden">
            <span
              style={{
                color: highestRole?.color,
              }}
              className={`whitespace-nowrap text-ellipsis overflow-hidden`}
            >
              {member.displayName}
            </span>
            {open ? (
              <span
                className={`text-sm font-medium ${
                  open ? "text-csblue-50" : null
                } whitespace-nowrap text-ellipsis overflow-hidden`}
              >
                {"@" + member.username}
              </span>
            ) : null}
            {user.status && !open && member.isOnline ? (
              <span className=" bottom-[-0.2rem] text-sm text-csblue-50 whitespace-nowrap text-ellipsis overflow-hidden">
                {user?.status}
              </span>
            ) : null}
          </div>
        </section>
        {open ? (
          <section className="p-2 flex flex-col gap-2">
            <div className="text-sm font-medium w-full bg-csblue-400 divide-y-[1px] divide-csblue-200 rounded-md p-2 flex flex-col">
              <MemberRoleList member={member} />
              {user.status ? (
                <DataSection firstRow="STATUS" secondRow={user.status} />
              ) : null}
              <div className="divide-y-[1px] divide-csblue-200">
                <DataSection
                  firstRow="CREATED AT"
                  secondRow={new Date(user.createdAt).toDateString()}
                />
                {member?.joinedAt ? (
                  <DataSection
                    firstRow="JOINED AT"
                    secondRow={new Date(member?.joinedAt).toDateString()}
                  />
                ) : null}
              </div>
            </div>
            {user.status ? (
              <div className="text-sm font-medium w-full bg-csblue-400 divide-y-[1px] divide-csblue-200 rounded-md p-2 flex flex-col">
                <DataSection firstRow="ABOUT" secondRow={user.status} />
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
      <MemberMenu
        open={contextualOpen}
        coordinates={coordinates}
        member={member}
      />
    </>
  )
}

export default Participant
