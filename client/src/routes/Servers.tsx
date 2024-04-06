import ServerSidebar from "../components/server/serverSidebar"
import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"
import { RootState } from "../components/redux/store"
import PageWrapper from "../lib/pageWrapper"
const Servers = () => {
  const chat = useSelector((state: RootState) => state.chat)
  return (
    <PageWrapper title="Servers">
      <main className="w-full h-full grid grid-cols-[80px_1fr]">
        <ServerSidebar servers={chat.servers} />
        <Outlet />
      </main>
    </PageWrapper>
  )
}

export default Servers
