import { useMemo, useRef, useState } from "react"
import { ReactEditor, withReact } from "slate-react"
import { withMentions } from "../slate/withMentions"
import { HistoryEditor } from "slate-history"

import { createEditor, Descendant, BaseEditor } from "slate"
import { Channel, Member, Role, partialUser } from "../../types"
import Tooltip from "../tooltip"

import { socket } from "../../socket/socketInitializer"
import MarkdownPreviewer from "../slate/markdownPreviewer"

import { serialize } from "../slate/serialization"

import { findMentions } from "../slate/findMentions"

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "",
      },
    ],
  },
]

const Image = ({ src, onRemove }: { src: string; onRemove?: () => any }) => {
  return (
    <div className="relative">
      <img className=" h-32 rounded-md cursor-pointer" src={src} />
      <div className="absolute left-[100%] translate-x-[-50%] top-[0%]">
        <Tooltip text="Delete attachment">
          <button
            onClick={(e) => (onRemove ? onRemove() : null)}
            className="inline-flex bg-csblue-300 text-red-400 p-1 hover:bg-csblue-200 rounded-md"
          >
            <i className="bi bi-trash3-fill"></i>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

const MessageBox = ({
  channel,
  placeholder,
  mentions,
  onSend,
}: {
  channel: Channel
  placeholder?: string
  mentions?: {
    users?: partialUser[]
    members?: Member[]
    roles?: Role[]
  }
  onSend?: () => any
}) => {
  const [attachments, setAttachments] = useState([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editor = useMemo<BaseEditor & ReactEditor & HistoryEditor>(
    () => withMentions(withReact(createEditor())),
    [],
  )
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div className="bg-csblue-100 rounded-2xl flex flex-col divide-csblue-300">
      {attachments.length ? (
        <div className="px-2 pt-2">
          <div className="flex flex-wrap gap-2 border-csblue-150 pb-2 border-b-[1px]">
            {attachments.map((attachment: string, index) => (
              <Image
                src={attachment}
                onRemove={() => {
                  var files = attachments
                  files = files.filter((file, index) => index !== index)

                  const oldFiles = fileInputRef.current.files ?? []
                  const newFiles = new DataTransfer()
                  for (let i = 0; i < oldFiles.length; i++) {
                    if (i !== index) newFiles.items.add(oldFiles[i])
                  }
                  fileInputRef.current.files = newFiles.files
                  setAttachments(files)
                }}
              />
            ))}
          </div>
        </div>
      ) : null}
      <div ref={containerRef} className="flex pl-2 gap-3 items-center">
        <label
          className={` cursor-pointer flex px-2 text-sm flex justify-center items-center text-cspink-200 rounded-md`}
        >
          <input
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0]
              if (!file) return
              var fileReader = new FileReader()

              fileReader.onload = (e) => {
                setAttachments([...attachments, e.target.result])
              }

              fileReader.readAsDataURL(file)
            }}
            className="w-0 absolute opacity-0"
            type="file"
            accept="image/gif, image/jpeg, image/png"
          />
          <i className="bi bi-send-plus-fill"></i>
        </label>
        <div className="w-full max-h-[50vh] overflow-x-hidden overflow-y-auto">
          <MarkdownPreviewer
            editor={editor}
            initialValue={initialValue}
            placeholder={placeholder ? placeholder : `Message @${channel.name}`}
            containerRef={containerRef}
            {...(mentions && { mentions: mentions })}
          />
        </div>
        <Tooltip text="Send" containerClassName="flex items-center">
          <button
            onClick={async (e) => {
              const content = serialize(editor)
              const mentions = findMentions(editor.children, "user").map(
                (descendant) => descendant._id,
              )
              const mentionedRoles = findMentions(editor.children, "role").map(
                (descendant) => descendant._id,
              )

              socket.emit("messageAdded", {
                content: content,
                ...(mentions.length && { mentions: mentions }),
                ...(mentionedRoles.length && {
                  mentionedRoles: mentionedRoles,
                }),
                attachments: attachments,
                channelId: channel._id,
                serverId: channel.serverId,
              })
              socket.once("channelChanged", () => {
                onSend?.()
              })
            }}
            className="bg-cspink-200 cursor-pointer rounded-2xl w-16 text-cspink-50 aspect-square"
          >
            <i className="bi bi-send"></i>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default MessageBox
