import Sidebar from "../components/sidebar"
import { Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../components/redux/store"
import UserSettings from "../components/modals/userSettings/userSettings"
import ChangeStatus from "../components/modals/changeStatus"
import ServerSettings from "../components/modals/serverSettings/serverSettings"
import { useEffect } from "react"
import { socket } from "../socket/socketInitializer"
const App = () => {
  const user = useSelector((state: RootState) => state.user)

  return (
    <>
      {!user.isSignedIn ? (
        <div></div>
      ) : (
        <>
          <main className="max-w-screen h-screen grid grid-cols-[80px,_1fr] bg-csblue-200">
            <Sidebar />
            <Outlet />
            <UserSettings />
            <ChangeStatus />
            <ServerSettings />
          </main>
        </>
      )}
    </>
  )
}

export default App
