import {
  activeParameterRemoved,
  changeInput,
  getActiveParameter,
  getInput,
  getParameters,
  resetFetch,
} from "../../redux/reducers/searchReducer"
import { useSelector, useDispatch } from "react-redux"
import {
  fromRemoved,
  inRemoved,
  afterRemoved,
  beforeRemoved,
  pinnedRemoved,
} from "../../redux/reducers/searchReducer"
import { resetState } from "../../redux/reducers/searchReducer"
import { searchOpened } from "../../redux/reducers/UIReducer"
import { Channel, DM, Message, partialUser } from "../../../types"
import { useEffect, useState, useRef } from "react"
import MessageComponent from "../message"
import { RootState } from "../../redux/store"
import { getFilteredMessages } from "../../../lib/DB"
import { createPortal } from "react-dom"

export const parameterRemovers = {
  from: fromRemoved,
  in: inRemoved,
  after: afterRemoved,
  before: beforeRemoved,
  pinned: pinnedRemoved,
}

const UserParameter = ({ user }: { user?: partialUser }) => {
  return user ? (
    <span className="">
      <span className="w-4 aspect-square rounded-full bg-csblue-200" />
      <span>{user.username}</span>
    </span>
  ) : null
}

const ChannelParameter = ({ channel }: { channel?: Channel }) => {
  return channel ? (
    <span className="">
      <span className="w-4 aspect-square rounded-full bg-csblue-200" />
      <span>{channel.name}</span>
    </span>
  ) : null
}

const MESSAGES_PER_PAGE = 10

const SearchSection = ({
  serverId,
  channel,
}: {
  serverId?: string
  channel?: Channel
}) => {
  const dispatch = useDispatch()
  const parameters = useSelector(getParameters())
  const channels = useSelector((state: RootState) => state.chat.channels)
  const activeParameter = useSelector(getActiveParameter())

  const [fetchedMessages, setFetchedMessages] = useState<{
    messages: { [channelId: string]: Message[] }
    count: number
    fetchedPages: Array<boolean>
  }>({ messages: {}, count: 0, fetchedPages: [] })
  const [activePage, setActivePage] = useState(1)
  const [fetching, setFetching] = useState(false)
  const [open, setOpen] = useState(false)
  const expandRef = useRef<HTMLButtonElement>(null)
  const upperSectionRef = useRef<HTMLDivElement>(null)
  const input = useSelector(getInput())

  const user = useSelector((state: RootState) => state.user)
  const users = useSelector((state: RootState) => state.chat.users)

  const pageCount =
    fetchedMessages.count % MESSAGES_PER_PAGE !== 0
      ? fetchedMessages.count / MESSAGES_PER_PAGE + 1
      : fetchedMessages.count / MESSAGES_PER_PAGE

  const getOverallMessageLength = Object.values(
    fetchedMessages.messages,
  ).reduce((accumulator, messages) => (accumulator += messages.length), 0)

  const getComponent = (parameter: keyof typeof parameters) => {
    switch (parameter) {
      case "from": {
        return <UserParameter user={parameters[parameter]?.user} />
      }
      case "in": {
        return channel !== undefined ? null : (
          <ChannelParameter channel={parameters[parameter]} />
        )
      }
      case "before":
        return <span>{parameters[parameter]}</span>
      case "after":
        return <span>{parameters[parameter]}</span>
      case "pinned":
        return <span>{parameters[parameter] === true ? "true" : "false"}</span>
    }
  }

  useEffect(
    () => console.log(fetchedMessages.messages),
    [fetchedMessages.messages],
  )
  useEffect(() => {
    if (
      (input.changed == true || input.changed == false) &&
      !fetchedMessages.fetchedPages[activePage]
    ) {
      setFetching(true)

      const messages = getFilteredMessages({
        serverId: serverId,
        channelId: channel?._id,
        options: {
          ...(parameters.before && {
            before: parameters.before,
          }),
          page: activePage.toString(),
          ...(parameters.after && {
            before: parameters.after,
          }),
          ...(parameters.pinned && {
            pinned: parameters.pinned ? "true" : "false",
          }),
          ...(parameters.in && { channelId: parameters.in._id }),
          ...(parameters.from && { from: parameters.from.user._id }),
          ...(input.value.length && { input: input.value }),
        },
      })

      messages.then((data) => {
        var newMessages = fetchedMessages.messages
        data.messages.forEach((message) =>
          newMessages[message.channelId]
            ? newMessages[message.channelId].push(message)
            : (newMessages[message.channelId] = [message]),
        )

        var newFetchedPages = fetchedMessages.fetchedPages
        newFetchedPages[activePage] = true

        setFetching(false)
        setFetchedMessages({
          messages: newMessages,
          count: data.count ?? fetchedMessages.count,
          fetchedPages: newFetchedPages,
        })
      })
    }
  }, [input.changed, activePage])

  useEffect(() => {
    setFetchedMessages({ messages: {}, count: 0, fetchedPages: [] })
    dispatch(resetFetch({}))
  }, [parameters])

  useEffect(() => {
    setFetchedMessages({ messages: {}, count: 0, fetchedPages: [] })
  }, [input.value])
  return (
    <>
      <section
        onClick={(e) => e.stopPropagation()}
        id="searchSection"
        className={`bg-csblue-300 w-full p-4 h-screen overflow-y-auto flex flex-col gap-y-2`}
      >
        <div ref={upperSectionRef} className="flex flex-col gap-y-2">
          <div className="h-[40px] font-bold text-lg text-csblue-100 w-full flex justify-between items-center overflow-y-auto">
            <h1>SEARCH PARAMETERS</h1>
            <button
              onClick={(e) => {
                dispatch(searchOpened(false))
                dispatch(resetState({}))
                setFetchedMessages({ messages: {}, count: 0, fetchedPages: [] })
              }}
              className="w-8 flex justify-center items-center rounded-full aspect-square border-[2px] border-csblue-100"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          {Object.keys(parameters).length ? (
            <ul className="whitespace-nowrap flex flex-wrap justify-start p-2 gap-2 bg-csblue-400 rounded-md">
              {(Object.keys(parameters) as Array<keyof typeof parameters>).map(
                (parameter: keyof typeof parameters) => (
                  <span
                    key={parameter}
                    className="overflow-hidden flex gap-1 items-center text-csblue-50 font-semibold p-1 rounded-md bg-csblue-500"
                  >
                    <span className="text-ellipsis overflow-hidden">
                      <span className="text-csblue-100">{parameter}: </span>
                      {getComponent(parameter)}
                    </span>

                    <button
                      onMouseDown={(e) => {
                        e.preventDefault()

                        dispatch(parameterRemovers[parameter]({}))
                        if (parameter === activeParameter) {
                          dispatch(activeParameterRemoved({}))
                        }
                      }}
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  </span>
                ),
              )}
            </ul>
          ) : null}
        </div>
        {input?.changed != null ? (
          <section className="flex flex-col gap-4">
            {getOverallMessageLength ? (
              <div className="flex justify-between">
                <ul className="flex gap-1">
                  {[1, 2, 3].map((page) =>
                    pageCount >= page ? (
                      <button
                        onClick={(e) => setActivePage(page)}
                        className="rounded-full bg-csblue-100 w-6 h-6 text-xs font-bold inline-flex justify-center items-center text-cspink-50"
                      >
                        {page}
                      </button>
                    ) : null,
                  )}
                  {pageCount > 4 ? (
                    <button
                      ref={expandRef}
                      onClick={(e) => setOpen(!open)}
                      className="rounded-full bg-csblue-100 w-6 h-6 text-xs font-bold inline-flex justify-center items-center text-cspink-50"
                    >
                      ...
                    </button>
                  ) : null}
                  {pageCount > 3 ? (
                    <button
                      onClick={(e) => setActivePage(pageCount)}
                      className="rounded-full bg-csblue-100 w-6 h-6 text-xs font-bold inline-flex justify-center items-center text-cspink-50"
                    >
                      {pageCount}
                    </button>
                  ) : null}
                </ul>

                <span className="text-csblue-50 font-semibold">
                  {fetchedMessages.count} messages
                </span>
              </div>
            ) : null}
            <ul className="mt-2 overflow-y-auto darker">
              {fetching ? (
                <div className=" w-full h-full flex justify-center items-center">
                  <i className="text-2xl font-bold text-csblue-50 animate-spin bi bi-arrow-clockwise"></i>
                </div>
              ) : getOverallMessageLength ? (
                Object.entries(fetchedMessages.messages).map(
                  ([channelId, messages]) =>
                    serverId ? (
                      <section className="flex flex-col gap-1">
                        <h1 className="text-csblue-100 font-bold">
                          #{channels[channelId].name}
                        </h1>
                        <ul className="self-start w-full">
                          {messages
                            .slice(
                              (activePage - 1) * MESSAGES_PER_PAGE,
                              activePage * MESSAGES_PER_PAGE,
                            )
                            .map((message) => (
                              <MessageComponent
                                message={message}
                                user={user}
                                editable={false}
                                mentions={{ users: Object.values(users) }}
                              />
                            ))}
                        </ul>
                      </section>
                    ) : (
                      <ul className="self-start w-full">
                        {messages
                          .slice(
                            (activePage - 1) * MESSAGES_PER_PAGE,
                            activePage * MESSAGES_PER_PAGE,
                          )
                          .map((message) => (
                            <MessageComponent
                              message={message}
                              user={user}
                              editable={false}
                              mentions={{ users: Object.values(users) }}
                            />
                          ))}
                      </ul>
                    ),
                )
              ) : Object.values(parameters).length ? (
                <h1 className="text-center font-bold text-csblue-100">
                  Sorry, we couldn't find any messages that match the criteria
                </h1>
              ) : null}
            </ul>
          </section>
        ) : null}
      </section>
      {open
        ? createPortal(
            <div
              style={{
                left: expandRef.current.getBoundingClientRect().left + "px",
                top: expandRef.current.getBoundingClientRect().top + "px",
              }}
              className="mt-2 absolute grid grid-cols-8 w-20 rounded p-2 gap-1 bg-csblue-400"
            >
              {Array.from(
                { length: pageCount - 3 },
                (value, index) => index + 3,
              ).map((page) => (
                <button onClick={(e) => setActivePage(page)}>{page}</button>
              ))}
            </div>,
            document.getElementById("root"),
          )
        : null}
    </>
  )
}

export default SearchSection
