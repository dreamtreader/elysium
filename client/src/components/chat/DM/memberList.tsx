import { useSelector } from "react-redux"
import { partialUser } from "../../../types"
import Participant from "./participant.Profile"
import { getDMParticipants } from "../../redux/reducers/chatReducer"
const MemberList = ({ channelId }: { channelId: string }) => {
  const users = useSelector(getDMParticipants(channelId))
  return (
    <section className="p-5 w-full h-full flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-cspink-50">
          Participants - {users.length}
        </h1>
        <ul className="flex flex-col gap-2">
          {users.map((user: partialUser) => (
            <Participant key={user._id} user={user} />
          ))}
        </ul>
      </div>
    </section>
  )
}

export default MemberList
