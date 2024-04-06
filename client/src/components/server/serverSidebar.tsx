import { useState } from "react"
import Tooltip from "../tooltip"
import { useParams } from "react-router-dom"

import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Server } from "../../types/entityTypes"
import { openModalChanged } from "../redux/reducers/UIReducer"
import ServerModal from "../modals/createServer"
import ServerMenu from "../contextualMenus/server"
import {
  getServerPings,
  getTotalServerPings,
} from "../redux/reducers/pingReducer"
import PingIcon from "../chat/pingIcon"

type params = {
  serverId: string
}

const ServerIcon = ({
  server,
  setActiveServer,
  setCoordinates,
}: {
  server: Server
  setActiveServer: (server: string) => any
  setCoordinates: ({ x, y }) => any
}) => {
  const pings = useSelector(getServerPings(server._id))
  const { serverId } = useParams<params>()

  return (
    <Tooltip
      text={server.name}
      key={server._id}
      placement="right"
      containerClassName="w-full"
    >
      <PingIcon pingLength={pings.length ?? 0}>
        <Link
          onContextMenu={(e) => {
            e.preventDefault()
            setActiveServer(server._id)
            setCoordinates({ x: e.pageX, y: e.pageY })
            window.addEventListener("click", (e) => {
              e.stopPropagation()
              setActiveServer("")
              window.removeEventListener("click", () => {})
            })
          }}
          {...(server.avatar && {
            style: {
              backgroundImage: `url(${server.avatar})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            },
          })}
          className={`${
            serverId === server._id ? `rounded-[1.3rem]` : `icon`
          } w-full inline-flex justify-center items-center max-w-16 text-cspink-50 font-bold aspect-square bg-csblue-400 cursor-pointer`}
          key={server.name}
          to={`${
            serverId === server._id
              ? `/app/servers/${server._id}`
              : server.activeChannel
              ? `/app/servers/${server._id}/${server.activeTopic}/channels/${server.activeChannel}`
              : `/app/servers/${server._id}`
          }`}
        >
          {!server.avatar
            ? server.name
                .toUpperCase()
                .split(" ")
                .map((string) => string.charAt(0))
            : null}
        </Link>
      </PingIcon>
    </Tooltip>
  )
}
const ServerSidebar = ({
  servers,
}: {
  servers: { [serverId: string]: Server }
}) => {
  const { serverId } = useParams<params>()

  const dispatch = useDispatch()
  const [activeServer, setActiveServer] = useState("")
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })

  return (
    <>
      <section className="w-full h-full p-2 flex flex-col gap-2 justify-center items-center border-r-2 border-csblue-300">
        {Object.values(servers).map((server) => (
          <ServerIcon
            server={server}
            setActiveServer={setActiveServer}
            setCoordinates={setCoordinates}
          />
        ))}
        <button
          onClick={(e) => dispatch(openModalChanged({ type: "createServer" }))}
          className="icon w-full inline-flex justify-center items-center max-w-16 text-csblue-100 font-bold aspect-square bg-csblue-400 cursor-pointer hover:text-cspink-50 hover:bg-cspink-200"
        >
          <i className="bi bi-plus-lg stroke-1"></i>
        </button>
      </section>
      <ServerModal />
      {servers[activeServer] ? (
        <ServerMenu
          server={servers[activeServer]}
          open={Boolean(activeServer.length)}
          coordinates={coordinates}
        />
      ) : null}
    </>
  )
}

export default ServerSidebar
