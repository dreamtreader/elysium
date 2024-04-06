import { CHANNEL_IDS, DM, GroupDM, User } from "../../../types"
import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { getUserById, getUsersByIds } from "../../redux/reducers/chatReducer"
import { useSelector } from "react-redux"
import { getDMPings } from "../../redux/reducers/pingReducer"
import PingIcon from "../pingIcon"

type params = {
  channelId: string
}

const DMComp = ({ DM, selfUser }: { DM: DM | GroupDM; selfUser: User }) => {
  const { channelId } = useParams<params>()

  const recipients = useSelector(getUsersByIds(DM.recipients))

  const recipientUser = recipients.find(
    (recipient) => recipient._id !== selfUser._id,
  )

  const pings = useSelector(getDMPings(DM._id))

  const name = useMemo(
    () =>
      DM.type === CHANNEL_IDS.GROUP_DM
        ? DM.name
          ? DM.name
          : recipients
              .sort((a, b) => (a.displayName > b.displayName ? 1 : -1))
              .reduce((accumulator, currentUser, index) => {
                return (
                  accumulator +
                  currentUser.displayName +
                  (index < recipients.length - 1 ? ", " : "")
                )
              }, "")
        : recipientUser?.displayName ?? "",
    [DM._id, recipients],
  )

  return (
    <Link
      to={`${DM._id}`}
      className={`inline-block ${
        channelId == DM._id
          ? `bg-cspink-100`
          : pings?.length
          ? `bg-csblue-100 hover:bg-cspink-200`
          : `bg-csblue-300 hover:bg-csblue-100`
      } w-full p-2 rounded-md grid grid-cols-[2rem,_1fr] items-center gap-2 shrink-0`}
    >
      <PingIcon pingLength={pings ? pings?.length : 0}>
        <span
          {...((recipientUser.avatar ||
            ((DM as GroupDM).avatar && DM.type === CHANNEL_IDS.GROUP_DM)) && {
            style: {
              backgroundImage: `url(${
                (DM as GroupDM).avatar
                  ? (DM as GroupDM).avatar
                  : DM.type === CHANNEL_IDS.DM
                  ? recipientUser.avatar
                  : ""
              })`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            },
          })}
          className="bg-csblue-500 w-8 h-8 rounded-full"
        />
      </PingIcon>
      <span className="text-cspink-50 whitespace-nowrap text-ellipsis overflow-hidden text-lg font-semibold">
        {name || "Fetching.."}
      </span>
    </Link>
  )
}

export default DMComp
