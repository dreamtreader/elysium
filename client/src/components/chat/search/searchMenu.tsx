import { useSelector, useDispatch } from "react-redux"
import { KeyboardEvent, useState, useRef, RefObject } from "react"
import { useParams } from "react-router-dom"
import {
  parameterChanged,
  activeParameterChanged,
  getActiveParameter,
  getParameters,
  activeParameterRemoved,
  changeInput,
} from "../../redux/reducers/searchReducer"
import { CHANNEL_IDS, SearchParameter, partialUser } from "../../../types"
import { parameterRemovers } from "./searchSection"
import { searchOpened } from "../../redux/reducers/UIReducer"
import { filterChannels, filterUsers } from "../../redux/reducers/chatReducer"

import { filterMembers } from "../../redux/reducers/memberReducer"
import { RootState } from "../../redux/store"

type params = {
  serverId: string
}
type Parameter = {
  string: SearchParameter
  type: string
  extraConditions?: () => Boolean
}

const ChannelMenu = ({
  serverId,
  input,
}: {
  serverId: string
  input: string
}) => {
  const channels = useSelector(filterChannels(serverId, input))
  const dispatch = useDispatch()
  return (
    <ul>
      {channels.map((channel) => (
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            dispatch(
              parameterChanged({
                parameter: "in",
                data: channel,
              }),
            )
            dispatch(activeParameterRemoved({}))
          }}
          className="rounded-sm text-left hover:bg-csblue-400 hover:text-cspink-50 w-full p-2 text-csblue-100 font-semibold flex gap-2 items-center"
        >
          <span className="bg-csblue-300 h-8 aspect-square rounded-full inline-flex" />
          <span className="text-cspink-50 text-lg">{channel.name}</span>
        </button>
      ))}
    </ul>
  )
}

const MentionMemberMenu = ({
  onClick,
  serverId,
  input,
}: {
  serverId: string
  input: string
  onClick?: (member: any, users: any) => any
}) => {
  const members = useSelector(filterMembers(serverId, input))
  const users = useSelector((state: RootState) => state.chat.users)
  return (
    <ul>
      {members.map((member) => (
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onClick ? onClick(member, users) : null
          }}
          className="rounded-sm text-left hover:bg-csblue-400 hover:text-cspink-50 w-full p-2 text-csblue-100 font-semibold flex gap-2 items-center"
        >
          <span
            style={{
              backgroundImage: `url(${
                member.avatar ?? users[member.userId].avatar
              })`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
            className="bg-csblue-300 h-8 aspect-square rounded-full inline-flex"
          />
          <span className="text-cspink-50 text-lg">
            {member.displayName || users[member.userId].displayName}
          </span>
          <span>@{users[member.userId].username}</span>
        </button>
      ))}
    </ul>
  )
}

const User = ({
  users,
  user,
  onClick,
}: {
  users: partialUser[]
  user: partialUser
  onClick?: (users, user) => any
}) => {
  return (
    <button
      onClick={(e) => (onClick ? onClick(users, user) : null)}
      className="p-2 rounded-sm text-left hover:bg-csblue-400 hover:text-cspink-50 w-full p-2 text-csblue-100 font-semibold flex gap-2 items-center"
    >
      <span
        style={{
          backgroundImage: `url(${user.avatar})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="bg-csblue-300 h-8 aspect-square rounded-full inline-flex"
      />
      <span className="text-cspink-50 text-lg">{user.displayName}</span>
      <span>@{user.username}</span>
    </button>
  )
}

const UserMentionMenu = ({
  input,
  onClick,
}: {
  input: string
  onClick?: (users, user) => any
}) => {
  const users = useSelector(filterUsers(input))

  return (
    <div className="w-full mb-2">
      {users.map((user) => (
        <User users={users} onClick={() => onClick(users, user)} user={user} />
      ))}
    </div>
  )
}

const DateMenu = ({ type }: { type: "before" | "after" }) => {
  const dispatch = useDispatch()
  return (
    <input
      className="bg-csblue-300 rounded p-1 text-csblue-200"
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        dispatch(
          parameterChanged({
            parameter: type,
            data: e.target.value,
          }),
        )
        dispatch(activeParameterRemoved({}))
      }}
      min="2018-01-01"
      max={new Date().toLocaleString("EN-CA").slice(0, 10)}
      type="date"
    />
  )
}

const PinnedMenu = () => {
  const dispatch = useDispatch()

  return (
    <div className="flex">
      <button
        onClick={(e) => {
          dispatch(
            parameterChanged({
              parameter: "pinned",
              data: false,
            }),
          )
          dispatch(activeParameterRemoved({}))
        }}
        className="text-csblue-50 font-bold p-1 px-2 bg-csblue-200 rounded-tl rounded-bl"
      >
        False
      </button>
      <button
        onClick={(e) => {
          dispatch(
            parameterChanged({
              parameter: "pinned",
              data: true,
            }),
          )
          dispatch(activeParameterRemoved({}))
        }}
        className="text-cspink-50 font-bold p-1 px-2 bg-cspink-200 rounded-tr rounded-br"
      >
        True
      </button>
    </div>
  )
}
const parameters: { [key: string]: Parameter } = {
  from: {
    string: "from",
    type: "user",
  },
  in: {
    string: "in",
    type: "channel",
  },
  before: {
    string: "before",
    type: "timestamp",
  },
  after: {
    string: "after",
    type: "timestamp",
  },

  pinned: {
    string: "pinned",
    type: "true or false",
  },
}

const DefaultMenu = ({
  inputRef,
  channelType,
}: {
  inputRef: RefObject<HTMLInputElement>
  channelType: number
}) => {
  const dispatch = useDispatch()
  return (
    <>
      <h2 className="font-bold text-csblue-100">SEARCH OPTIONS</h2>
      <ul className="flex flex-col">
        {(channelType != CHANNEL_IDS.TEXT
          ? Object.values(parameters).filter(
              (parameter) => parameter.string !== "in",
            )
          : Object.values(parameters)
        ).map((parameter: Parameter) => (
          <button
            key={parameter.string}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              inputRef?.current?.focus()
              dispatch(
                activeParameterChanged({
                  activeParameter: parameter.string,
                }),
              )
              dispatch(
                parameterChanged({
                  parameter: parameter.string,
                  data: true,
                }),
              )
            }}
            className="rounded-sm text-left hover:bg-csblue-400 hover:text-cspink-50 w-full p-2 text-csblue-100 font-semibold"
          >
            <span className="text-cspink-50 font-bold">
              {parameter.string}:{" "}
            </span>
            {parameter.type}
          </button>
        ))}
      </ul>
    </>
  )
}

const Search = ({
  className,
  channelType,
}: {
  className?: string
  channelType: number
}) => {
  const [searchParamsActive, setSearchParamsActive] = useState(false)
  const activeParameter = useSelector(getActiveParameter())

  const filledParameters = useSelector(getParameters())

  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()
  const { serverId } = useParams<params>()

  if (!serverId && channelType === CHANNEL_IDS.TEXT) return null

  const ActiveMenus: { [key: string]: JSX.Element | string | boolean } = {
    from:
      channelType == CHANNEL_IDS.TEXT ? (
        <MentionMemberMenu
          onClick={(member, users) => {
            dispatch(
              parameterChanged({
                parameter: "from",
                data: { member: member, user: users[member.userId] },
              }),
            )
            dispatch(activeParameterRemoved({}))
            setInput("")
          }}
          serverId={serverId}
          input={input}
        />
      ) : (
        <UserMentionMenu
          input={input}
          onClick={(users, user) => {
            dispatch(
              parameterChanged({
                parameter: "from",
                data: { user: users[user._id] },
              }),
            )
            dispatch(activeParameterRemoved({}))
            setInput("")
          }}
        />
      ),
    ...(channelType === CHANNEL_IDS.TEXT && {
      in: <ChannelMenu serverId={serverId} input={input} />,
    }),
    before: <DateMenu type="before" />,
    after: <DateMenu type="after" />,
    pinned: <PinnedMenu />,
  }

  return (
    <div className={className}>
      <input
        placeholder={`Search..`}
        ref={inputRef}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        type="text"
        value={input}
        className="font-semibold w-1/2 focus:w-full rounded-md searchbar text-sm bg-csblue-400 text-csblue-100 p-2 text-ellipsis overflow-hidden"
        onFocus={(e) => {
          dispatch(searchOpened(true))
          setSearchParamsActive(true)
          document.body.addEventListener("click", (e: MouseEvent) => {
            setSearchParamsActive(false)

            document.body.removeEventListener("click", () => {})
          })
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (activeParameter && e.code == "Enter") {
            dispatch(parameterRemovers[activeParameter]({}))
            dispatch(activeParameterRemoved({}))
          } else if (e.code == "Enter") {
            dispatch(changeInput(input))
          }
        }}
        onInput={(e) => {
          setInput((e.target as HTMLInputElement).value)
          if (!activeParameter) {
            const parameter = parameters[input]
            /*Object.values(parameters).find((parameter) =>
                input.includes(parameter.string),
              ) */
            if (parameter) {
              dispatch(
                activeParameterChanged({
                  activeParameter: parameter.string,
                }),
              )
              dispatch(
                parameterChanged({ parameter: parameter.string, data: true }),
              )
              const newInput = input.replace(parameter.string, "")
              setInput(newInput)
            }
          }
        }}
      />

      {searchParamsActive ? (
        <div
          className={`p-2 z-200 w-full bg-csblue-500 rounded-md mt-2 absolute z-100 top-[100%]`}
        >
          {input.length === 0 && !activeParameter ? (
            <DefaultMenu channelType={channelType} inputRef={inputRef} />
          ) : input.length !== 0 ||
            activeParameter === "before" ||
            activeParameter === "after" ||
            activeParameter === "pinned" ? (
            activeParameter ? (
              ActiveMenus[activeParameter]
            ) : (
              <div className="divide-y-[2px] divide-csblue-300">
                {Object.keys(ActiveMenus).map((param) =>
                  !filledParameters[param as keyof typeof filledParameters] ? (
                    <div className="flex flex-col p-1">
                      <h1 className="text-csblue-100 font-bold">
                        {param.toUpperCase()}
                      </h1>
                      {ActiveMenus[param]}
                    </div>
                  ) : null,
                )}
              </div>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Search
