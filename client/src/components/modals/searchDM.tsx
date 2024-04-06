import Modal from "../../components/Modal"

import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { isActive, componentClosed } from "../redux/reducers/UIReducer"
import { socket } from "../../socket/socketInitializer"
import { getDMs } from "../redux/reducers/chatReducer"
import { CHANNEL_IDS, DM, GroupDM, partialUser } from "../../types"
import { RootState } from "../redux/store"
import { Link, useNavigate } from "react-router-dom"
import { getFriends } from "../redux/reducers/userReducer"

const UserItem = ({ user, DMs }: { user: partialUser; DMs: DM[] }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <button
      onClick={(e) => {
        const DM = DMs.find((channel) => channel.recipients.includes(user._id))
        if (DM) navigate(`/app/dms/${DM._id}`)
        else {
          socket.emit("DMAdded", { userId: user._id })
        }
        dispatch(componentClosed("openModal"))
      }}
      className="hover:bg-csblue-300 w-full p-2 rounded flex gap-2 rounded-md items-center"
    >
      <span
        {...(user.avatar && {
          style: {
            backgroundImage: `url(${user.avatar})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          },
        })}
        className="w-6 h-6 rounded-full bg-csblue-100"
      />
      <div className="flex gap-1">
        <h1 className="text-cspink-50 font-bold">{user.displayName}</h1>
        <h2 className="text-csblue-100 font-bold">{user.username}</h2>
      </div>
    </button>
  )
}

const SearchDM = () => {
  const userId = useSelector((state: RootState) => state.user._id)
  const dispatch = useDispatch()
  const [input, setInput] = useState("")
  const open = useSelector(isActive("searchDM", "openModal"))

  const users = useSelector((state: RootState) => state.chat.users)
  const DMs = useSelector(getDMs)

  return (
    <Modal open={open} onClose={() => dispatch(componentClosed("openModal"))}>
      <div className="bg-csblue-200 flex flex-col gap-4 w-screen max-w-md p-5 rounded-md">
        <h1 className="text-2xl font-bold text-cspink-50">Search in DMs</h1>

        <input
          type="text"
          placeholder="Search.."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={128}
          className="bg-csblue-400 text-csblue-100 rounded-md p-2"
        />

        <div className="rounded-md flex flex-col gap-2 bg-csblue-500 p-2">
          <section className="flex flex-col gap-2">
            <h1 className="text-csblue-100 font-bold ">USERS</h1>
            <ul className="max-h-48 overflow-y-auto divide-y-csblue-200 divide-y-[1px]">
              {Object.values(users)
                .filter((user) => {
                  const regExp = new RegExp(input)

                  return (
                    user._id !== userId &&
                    (regExp.test(user.displayName) ||
                      regExp.test(user.username))
                  )
                })
                .map((user) => (
                  <UserItem user={user} DMs={DMs} />
                ))}
            </ul>
          </section>
        </div>
      </div>
    </Modal>
  )
}

export default SearchDM
