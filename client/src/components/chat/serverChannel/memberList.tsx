import { useSelector } from "react-redux"
import { getServerMembers } from "../../redux/reducers/memberReducer"
import { RootState } from "../../redux/store"
import Participant from "./memberProfile"
import { fullMember } from "../../../types"
import { getServerRoles } from "../../redux/reducers/roleReducer"
import { sortByPosition } from "../../../lib/sortFunctions"

const MemberList = ({
  serverId,
  fetched,
}: {
  serverId: string
  fetched: boolean
}) => {
  const members = useSelector(getServerMembers(serverId))
  const users = useSelector((state: RootState) => state.chat.users)
  const serverRoles = useSelector(getServerRoles(serverId))

  const activeMembers = members.filter((member) => member.isOnline)
  const inactiveMembers = members.filter((member) => !member.isOnline)

  const activeRoles = serverRoles.filter((role) =>
    activeMembers.find((member) => member.roleIds[0] === role._id),
  )

  return (
    <section className="p-5 w-full h-full flex flex-col gap-5">
      {fetched ? (
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-cspink-50">Participants</h1>
          {activeRoles.sort(sortByPosition).map((role) => (
            <section className="flex flex-col">
              <h1 className="text-csblue-50 font-bold text-md">
                {role.name.toUpperCase()}
              </h1>
              <ul className="flex flex-col gap-2">
                {activeMembers
                  .filter((member) => member.roleIds[0] === role._id)
                  .map((member: fullMember) => {
                    if (users[member.userId]) {
                      return (
                        <Participant
                          key={member._id}
                          member={member}
                          user={users[member.userId]}
                        />
                      )
                    } else {
                      return <div>Fetching..</div>
                    }
                  })}
              </ul>
            </section>
          ))}
          {activeMembers.filter((member) => member.roleIds.length === 0)
            .length ? (
            <section className="flex flex-col">
              <h1 className="text-csblue-50 font-bold text-md">ONLINE</h1>
              <ul className="flex flex-col gap-2">
                {activeMembers
                  .filter((member) => member.roleIds.length === 0)
                  .map((member: fullMember) => {
                    if (users[member.userId]) {
                      return (
                        <Participant
                          key={member._id}
                          member={member}
                          user={users[member.userId]}
                        />
                      )
                    } else {
                      return <div>Fetching..</div>
                    }
                  })}
              </ul>
            </section>
          ) : null}
          {inactiveMembers.length ? (
            <section className="flex flex-col">
              <h1 className="text-csblue-50 font-bold text-md">OFFLINE</h1>
              <ul className="flex flex-col gap-2">
                {inactiveMembers.map((member: fullMember) => {
                  if (users[member.userId]) {
                    return (
                      <Participant
                        key={member._id}
                        member={member}
                        user={users[member.userId]}
                      />
                    )
                  } else {
                    return <div>Fetching..</div>
                  }
                })}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <div>Fetching..</div>
      )}
    </section>
  )
}

export default MemberList
