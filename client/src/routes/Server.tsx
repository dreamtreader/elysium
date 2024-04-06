import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../components/redux/store"
import { Outlet, useParams } from "react-router-dom"
import { useEffect } from "react"

import { getServerMembers } from "../lib/DB"
import MemberList from "../components/chat/serverChannel/memberList"
import ServerMenu from "../components/server/server"
import SearchSection from "../components/chat/search/searchSection"
import { isActive } from "../components/redux/reducers/UIReducer"
import PageWrapper from "../lib/pageWrapper"

import CreateChannel from "../components/modals/createChannel"

type params = {
  serverId: string
  channelId: string | undefined
}

const Server = () => {
  const chat = useSelector((state: RootState) => state.chat)
  const user = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()
  const { serverId } = useParams<params>()

  const show = useSelector(isActive(true, "openSearch"))

  if (serverId) {
    const server = chat.servers[serverId]

    return (
      <PageWrapper title={server.name}>
        <main
          className={`max-w-screen overflow-hidden h-screen grid ${
            show
              ? `grid-cols-[250px,_minmax(1rem,_1fr),_400px]`
              : `grid-cols-[250px,_minmax(1rem,_1fr),_250px]`
          } divide-x-[2px] divide-csblue-300`}
        >
          <ServerMenu server={server} />
          <Outlet />
          {show ? (
            <SearchSection serverId={serverId} />
          ) : (
            <MemberList serverId={serverId} fetched={server.fetched} />
          )}
          <CreateChannel />
        </main>
      </PageWrapper>
    )
  } else {
    return (
      <PageWrapper title={"Server unavailable"}>
        <main className="w-full h-full">
          <h1>Server unavailable</h1>
        </main>
      </PageWrapper>
    )
  }
}

export default Server
