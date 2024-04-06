import { RootState } from "./redux/store"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { activeCategoryChanged } from "./redux/reducers/chatReducer"
import UserMenu from "./userMenu"
import { useMemo } from "react"
import {
  getTotalDMPings,
  getTotalServerPings,
} from "./redux/reducers/pingReducer"
import PingIcon from "./chat/pingIcon"
import { getReceivedFriendRequests } from "./redux/reducers/userReducer"

export const IconButton = ({
  className,
  text,
  icon,
  pingSelector,
}: {
  className: string
  icon?: any
  text: string
  pingSelector?:
    | typeof getTotalDMPings
    | typeof getTotalServerPings
    | typeof getReceivedFriendRequests
}) => {
  const dispatch = useDispatch()
  const pings = pingSelector ? useSelector(pingSelector) : []

  if (pings.length)
    return (
      <PingIcon pingLength={pings.length ?? 0}>
        <button
          onClick={(e) => dispatch(activeCategoryChanged(text))}
          data-tooltip-target="tooltip-animation"
          type="button"
          className={`text-cspink-200 font-bold rounded-lg text-2xl px-4 ${className}`}
        >
          {icon}
        </button>
      </PingIcon>
    )
  else
    return (
      <button
        data-tooltip-target="tooltip-animation"
        type="button"
        className={`text-cspink-200 font-bold rounded-lg text-2xl px-4 ${className}`}
      >
        {icon}
      </button>
    )
}
const Sidebar = () => {
  const chat = useSelector((state: RootState) => state.chat)
  const user = useSelector((state: RootState) => state.user)
  const SidebarList = useMemo(
    () => [
      {
        name: "Friends",
        href: "friends",
        icon: <i className="bi bi-people"></i>,
        pings: getReceivedFriendRequests,
      },
      {
        name: "DMs",
        href: "dms",
        icon: <i className="bi bi-envelope-at"></i>,
        pings: getTotalDMPings,
      },
      {
        name: "Servers",
        href: "servers",
        icon: <i className="bi bi-chat-right"></i>,
        pings: getTotalServerPings,
      },
    ],
    [],
  )

  return (
    <section className="hidden md:flex flex-col p-4 border-r-2 border-csblue-300 justify-between items-center h-full">
      <div className="icon w-full text-white fill-white p-2 aspect-square bg-cspink-200">
        <div
          style={{
            backgroundImage: "url(/public/Elysium.svg)",
            backgroundSize: "cover",
          }}
          className="w-full h-full"
        ></div>
      </div>
      <ul className="flex flex-col gap-10">
        {SidebarList.map((option) => (
          <Link key={option.name} to={`/app/${option.href}`}>
            <IconButton
              className={`${
                chat.activeCategory === option.href
                  ? `text-cspink-50 bg-cspink-200 hover:bg-cspink-100`
                  : `text-cspink-100 hover:bg-csblue-100`
              } aspect-square`}
              text={option.name}
              icon={option.icon}
              {...(option.pings &&
                chat.activeCategory !== option.href && {
                  pingSelector: option.pings,
                })}
            />
          </Link>
        ))}
      </ul>
      <UserMenu user={user} />
    </section>
  )
}

export default Sidebar
