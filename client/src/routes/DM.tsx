import { useSelector } from "react-redux"
import { RootState } from "../components/redux/store"
import Chat from "../components/chat/DM/chat"
import { useParams } from "react-router-dom"
import PageWrapper from "../lib/pageWrapper"
import { CHANNEL_IDS, DM, GroupDM } from "../types"
import MemberList from "../components/chat/DM/memberList"
import { getDMPings } from "../components/redux/reducers/pingReducer"
import {
  getDMParticipants,
  getUserById,
} from "../components/redux/reducers/chatReducer"
import { useMemo } from "react"
import { isActive } from "../components/redux/reducers/UIReducer"
import SearchSection from "../components/chat/search/searchSection"

type params = {
  channelId: string
  serverId: string
}

const DMRoute = () => {
  const chat = useSelector((state: RootState) => state.chat)
  const user = useSelector((state: RootState) => state.user)
  const { channelId } = useParams<params>()

  const show = useSelector(isActive(true, "openSearch"))

  if (channelId) {
    const channel = chat.channels[channelId] as DM | GroupDM
    const pings = useSelector(getDMPings(channel._id))
    const participants = useSelector(getDMParticipants(channel._id))

    const otherRecipient = useMemo<string>(
      () =>
        channel.recipients.find(
          (recipientId: string) => recipientId !== user._id,
        ),
      [channel.recipients],
    )
    const recipientUser = useSelector(getUserById(otherRecipient))
    if (
      channel.type !== CHANNEL_IDS.DM &&
      channel.type !== CHANNEL_IDS.GROUP_DM
    )
      return <h1>Channel is not a valid DM.</h1>

    return (
      <PageWrapper
        title={
          channel.type == CHANNEL_IDS.DM
            ? "@" + recipientUser.displayName
            : channel.name
        }
      >
        <Chat channel={channel} />
        {show ? (
          <SearchSection channel={channel} />
        ) : (
          <MemberList channelId={channel._id} />
        )}
      </PageWrapper>
    )
  }
}

export default DMRoute
