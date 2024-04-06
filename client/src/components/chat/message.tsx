import {
  fullMember,
  Member,
  Message,
  partialUser,
  Role,
} from "../../types/entityTypes"
import { formatRelative } from "date-fns"
import { getUserById } from "../redux/reducers/chatReducer"
import { useDispatch, useSelector } from "react-redux"

import Image from "../image"
import Menu from "../menu"
import {
  componentClosed,
  isActive,
  setEditedMessage,
} from "../redux/reducers/UIReducer"

import { Mention } from "../../lib/mentioning"
import { useRef, useMemo } from "react"
import MarkdownPreviewer from "../slate/markdownPreviewer"
import { socket } from "../../socket/socketInitializer"

import { serialize, deserialize } from "../slate/serialization"

import { ReactEditor, withReact } from "slate-react"
import { withMentions } from "../slate/withMentions"
import { HistoryEditor } from "slate-history"

import { createEditor, BaseEditor } from "slate"
import { getHighestRole } from "../redux/reducers/roleReducer"
import { getMemberByUserId } from "../redux/reducers/memberReducer"

const MessageComponent = ({
  message,
  user,
  className = "",
  channelType = 0,
  member,
  mentions,
  editable = true,
}: {
  message: Message
  user: partialUser
  className?: string
  channelType?: number
  member?: fullMember
  mentions?: {
    users?: partialUser[]
    members?: Member[]
    roles?: Role[]
  }
  editable?: boolean
}) => {
  const author = useSelector(getUserById(message.authorId))
  const authorMember = useSelector(
    getMemberByUserId(author?._id, member?.serverId),
  )

  if (!author) return null
  const dispatch = useDispatch()

  const mention = new Mention()
  const selfCreated = message.authorId === user._id

  const editor = withMentions(withReact(createEditor()))

  const isEdited = useSelector(isActive(message._id, "editedMessage"))

  const isMentioned =
    message.mentions?.includes(user._id) ||
    message.mentionedRoles?.some((role) => member?.roleIds.includes(role))

  const content = new DOMParser().parseFromString(message.content, "text/html")

  const frontContent = mention.addMentions(
    message.content,
    channelType,
    message.mentions ?? [],
    message.mentionedRoles ?? [],
  )
  var highestRole
  if (authorMember) highestRole = useSelector(getHighestRole(authorMember?._id))

  const containerRef = useRef<HTMLSpanElement>()
  return (
    <div
      style={{
        ...(isMentioned && { backgroundColor: "rgba(233, 142, 173, 0.3)" }),
      }}
      className={`w-full flex gap-2 p-2  ${
        selfCreated ? `flex-row-reverse` : null
      }`}
    >
      <span
        style={{
          backgroundImage: `url(${
            authorMember?.avatar ? authorMember.avatar : author?.avatar ?? ""
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="self-start inline-flex w-8 aspect-square bg-csblue-400 rounded-full hover:rounded-xl"
      />

      <div className="flex flex-col gap-1">
        <span
          {...(highestRole?.color && { style: { color: highestRole.color } })}
          className={`${
            selfCreated ? "text-end" : null
          } font-bold text-md text-cspink-50`}
        >
          {author.displayName}
        </span>

        <div
          className={`flex gap-1 ${selfCreated ? `flex-row-reverse` : null}`}
        >
          {isEdited ? (
            <span
              ref={containerRef}
              className={`${className} text-cspink-50 rounded-xl ${
                selfCreated
                  ? "bg-cspink-200 rounded-tr-[0.1rem] self-end"
                  : "bg-csblue-100 rounded-tl-[0.1rem] self-start"
              } p-5 w-[50vw] whitespace-pre-wrap inline-flex items-center`}
            >
              <MarkdownPreviewer
                editor={editor}
                initialValue={deserialize(
                  content.body,
                  message.mentions,
                  message.mentionedRoles,
                )}
                {...(mentions && { mentions: mentions })}
                containerRef={containerRef}
                className="bg-csblue-300 p-2 rounded-md text-csblue-100"
              />
            </span>
          ) : (
            <>
              <span
                ref={containerRef}
                dangerouslySetInnerHTML={{
                  __html: frontContent,
                }}
                className={`${className} text-cspink-50 rounded-xl ${
                  selfCreated
                    ? "bg-cspink-200 rounded-tr-[0.1rem] self-end"
                    : "bg-csblue-100 rounded-tl-[0.1rem] self-start"
                } p-5 max-w-[50vw] whitespace-pre-wrap inline-flex items-center`}
              />
              {editable ? (
                <Menu
                  containerClassName="self-center"
                  placement={selfCreated ? "left" : "right"}
                  menuItems={[
                    [
                      {
                        content: "Edit message",
                        condition: selfCreated,
                        onClick: (e) => dispatch(setEditedMessage(message._id)),
                      },
                      {
                        content: "Delete message",
                        condition: selfCreated,
                        danger: true,
                        onClick: (e) =>
                          socket.emit("messageRemoved", {
                            messageId: message._id,
                          }),
                      },
                    ],
                  ]}
                  button={
                    <i className="bi text-csblue-100 hover:text-csblue-50 bi-three-dots-vertical"></i>
                  }
                />
              ) : null}
            </>
          )}
        </div>
        {isEdited ? (
          <div
            className={`flex gap-1 text-csblue-50 ${
              selfCreated ? `self-end` : null
            }`}
          >
            <span>
              Click to{" "}
              <button
                onClick={(e) => dispatch(componentClosed("editedMessage"))}
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                cancel
              </button>
            </span>
            <span>•</span>
            <span>
              Click to{" "}
              <button
                onClick={(e) => {
                  socket.emit("messageChanged", {
                    messageId: message._id,
                    content: serialize(editor),
                  })
                  dispatch(componentClosed("editedMessage"))
                }}
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                save
              </button>
            </span>
          </div>
        ) : null}
        {message.attachmentURLs?.length && !isEdited ? (
          <div className="grid max-w-full">
            {message.attachmentURLs
              ? message.attachmentURLs.map((attachment) => (
                  <Image
                    className="max-w-lg max-h-96"
                    URL={attachment}
                    uploaded={true}
                  />
                ))
              : null}
          </div>
        ) : null}
        <span
          className={`${
            selfCreated ? "text-end" : "text-start"
          } text-sm font-md text-csblue-100 ${
            isMentioned ? "text-csblue-50" : null
          }`}
        >
          {formatRelative(new Date(message.createdAt), new Date())}
        </span>
      </div>
    </div>
  )
}
export default MessageComponent
