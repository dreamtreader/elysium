import { useSelector } from "react-redux"
import { RootState } from "../components/redux/store"
import Chat from "../components/chat/serverChannel/chat"
import { useParams } from "react-router-dom"
import PageWrapper from "../lib/pageWrapper"

type params = {
  channelId: string
  serverId: string
}

const Channel = () => {
  const chat = useSelector((state: RootState) => state.chat)
  const { channelId } = useParams<params>()

  if (channelId) {
    const channel = chat.channels[channelId]
    return (
      <PageWrapper title={channel.name}>
        <Chat channel={channel} />
      </PageWrapper>
    )
  }
}

export default Channel
