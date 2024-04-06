import { CHANNEL_IDS, DM, GroupDM } from "../../../types/entityTypes"
import { useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import { useSelector } from "react-redux"
import { GetChannelMessages, SetLastReadMessage } from "../../../lib/DB"
import { useEffect, useRef, useMemo } from "react"

import MessageComponent from "../message"
import Search from "../search/searchMenu"

import MessageBox from "../messageBox"
import PreviewImage from "../../modals/previewImage"
import {
  channelPingsRemoved,
  getDMPings,
} from "../../redux/reducers/pingReducer"

import {
  getDMParticipants,
  getUserById,
  getUsersByIds,
} from "../../redux/reducers/chatReducer"

const SkeletonMessage = () => {
  return (
    <div className="rounded-md p-4 max-w-sm w-full">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-csblue-400 h-8 w-8 "></div>
        <div className="bg-csblue-400 rounded-md flex-1 space-y-6 py-4 p-4">
          <div className="h-2 bg-csblue-100 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-csblue-100 rounded col-span-2"></div>
              <div className="h-2 bg-csblue-100 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-csblue-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Chat = ({ channel }: { channel: DM | GroupDM }) => {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user)

  const frameRef = useRef<HTMLDivElement>(null)

  const pings = useSelector(getDMPings(channel._id))

  const participants = useSelector(getDMParticipants(channel._id))

  const recipients = useSelector(getUsersByIds(channel.recipients))

  const recipientUser = recipients.find(
    (recipient) => recipient._id !== user._id,
  )

  const name = useMemo(
    () =>
      channel.type === CHANNEL_IDS.GROUP_DM
        ? channel.name
          ? channel.name
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
    [channel._id, recipients],
  )

  useEffect(() => {
    if (pings?.length) dispatch(channelPingsRemoved({ channel: channel }))
  }, [channel._id])

  useEffect(() => {
    if (channel.messages.length) {
      const lastMessage = channel.lastMessageId
      if (lastMessage !== user.lastReadMessageIds[channel._id])
        SetLastReadMessage(dispatch, channel._id, lastMessage)
    }
  }, [channel._id, channel.messages.length, channel.lastMessageId])

  useEffect(() => {
    if (channel.fetched == false) {
      GetChannelMessages(channel._id, dispatch)
    }
  }, [channel])

  useEffect(() => {
    if (frameRef.current) {
      frameRef.current.scrollTop = frameRef.current.scrollHeight
    }
  }, [channel.fetched])

  return (
    <section className={`w-full h-screen flex flex-col gap-5 p-2`}>
      <div className="w-full bg-csblue-300 p-4 rounded-md flex items-center justify-between">
        <span className="font-bold text-xl text-cspink-50">{name}</span>
        <Search
          channelType={channel.type}
          className="relative w-1/2 flex justify-end"
        />
      </div>
      <div
        onScroll={(e) => {
          if (
            (e.target as HTMLDivElement).scrollTop === 0 &&
            !channel.fullyFetched &&
            channel.fetched
          ) {
            GetChannelMessages(
              channel._id,
              dispatch,
              channel.messages[0].createdAt,
            )
          }
          if (
            (e.target as HTMLDivElement).clientHeight +
              (e.target as HTMLDivElement).scrollTop >=
            (e.target as HTMLDivElement).scrollHeight
          ) {
            dispatch(channelPingsRemoved({ channel: channel }))
          }
        }}
        ref={frameRef}
        className="h-full overflow-y-auto overflow-x-visible py-4 flex flex-col gap-10"
      >
        {channel.fullyFetched ? (
          <div className="text-xl px-2 text-center text-csblue-500 font-bold">
            You have reached the end of this conversation
          </div>
        ) : (
          <SkeletonMessage />
        )}
        <div className="h-full flex flex-col gap-10">
          {channel.fetched
            ? channel.messages.length
              ? channel.messages.map((message) => (
                  <MessageComponent
                    mentions={{ users: participants }}
                    message={message}
                    user={user}
                  />
                ))
              : null
            : null}
        </div>
      </div>
      <div>
        <MessageBox
          channel={channel}
          placeholder={`Text @${name}`}
          mentions={{ users: participants }}
          onSend={() => {
            frameRef.current.scrollTop = frameRef.current.scrollHeight
          }}
        />
      </div>
      <PreviewImage />
    </section>
  )
}

export default Chat
