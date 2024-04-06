import { useDispatch, useSelector } from "react-redux"
import PageWrapper from "../lib/pageWrapper"
import { getConversations } from "../components/redux/reducers/chatReducer"
import { DM } from "../types"
import DMComp from "../components/chat/DM/DM"
import { useCallback } from "react"
import { RootState } from "../components/redux/store"
import { Outlet } from "react-router-dom"
import {
  isActive,
  openModalChanged,
} from "../components/redux/reducers/UIReducer"
import SearchDM from "../components/modals/searchDM"
import MultipleUserSelector from "../components/menus/multipleUserSelector"
import { getFriends } from "../components/redux/reducers/userReducer"
import { socket } from "../socket/socketInitializer"

const SecondarySidebar = ({ convos }: { convos: DM[] }) => {
  const dispatch = useDispatch()
  const friends = useSelector(getFriends)
  const selfUser = useSelector((state: RootState) => state.user)
  const filterDMs = useCallback((a: DM, b: DM) => {
    if (!a.lastMessageId && !b.lastMessageId) {
      return a.name > b.name ? 1 : -1
    } else if (!a.lastMessageId) return 1
    else if (!b.lastMessageId) return -1
    else if (a.lastMessageId === b.lastMessageId) a.name > b.name ? 1 : -1

    return a.lastMessageId > b.lastMessageId ? 1 : -1
  }, [])

  return (
    <section className="p-2 text-cspink-50">
      <div className="flex mt-4 mb-2 justify-between items-center">
        <h1 className="font-bold text-2xl">Direct messages</h1>
        <MultipleUserSelector
          onSubmit={(userIds) =>
            socket.emit("groupDMAdded", { userIds: userIds })
          }
          users={friends}
        />
      </div>
      <input
        placeholder="Search in DMs.."
        maxLength={0}
        className="w-full rounded text-csblue-100 mb-4 py-1 px-2 bg-csblue-300"
        type="text"
        onClick={(e) => dispatch(openModalChanged({ type: "searchDM" }))}
      />
      <ul className="flex flex-col gap-1">
        {convos
          .sort((a, b) => filterDMs(a, b))
          .map((DM) => (
            <DMComp DM={DM} selfUser={selfUser} />
          ))}
      </ul>
    </section>
  )
}

const DMs = () => {
  const convos = useSelector(getConversations)
  const show = useSelector(isActive(true, "openSearch"))
  return (
    <PageWrapper title="DMs">
      <main
        className={`max-w-screen overflow-x-hidden h-screen grid 
              grid-cols-[250px,_minmax(1rem,_1fr),_${show ? "400px" : "250px"}]
          } divide-x-[2px] divide-csblue-300`}
      >
        <SecondarySidebar convos={convos} />
        <Outlet />
      </main>
      <SearchDM />
    </PageWrapper>
  )
}

export default DMs
