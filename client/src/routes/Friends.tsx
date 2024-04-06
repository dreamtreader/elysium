import { useSelector } from "react-redux"
import PageWrapper from "../lib/pageWrapper"
import { RootState } from "../components/redux/store"
import { Outlet, useNavigate } from "react-router-dom"
import { User, partialUser } from "../types"
import { getDMs, getUsersByIds } from "../components/redux/reducers/chatReducer"

import { Tab } from "@headlessui/react"
import Menu from "../components/menu"
import { socket } from "../socket/socketInitializer"
import PingIcon from "../components/chat/pingIcon"
import { useState } from "react"

const FriendRequest = ({ user, type }: { user: partialUser; type: string }) => {
  return (
    <li className="p-3 hover:border-0 border-b-2 font-semibold border-csblue-300 hover:rounded-md flex justify-between items-center hover:bg-csblue-100">
      <section className="flex gap-2">
        <span
          className="inline-block w-[2rem] aspect-square bg-csblue-400 rounded-full"
          style={{
            backgroundImage: `url(${user.avatar})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <span className="text-cspink-50 text-lg">{user.displayName}</span>
        <span className="text-csblue-50 text-lg">{user.username}</span>
      </section>
      <Menu
        placement="left"
        button={
          <button className="">
            <i className="bi bi-three-dots-vertical"></i>
          </button>
        }
        menuItems={[
          [
            {
              content: `Accept friend request`,
              onClick: (e) => socket.emit("friendAdded", { userId: user._id }),
              condition: type === "received",
            },
            {
              content: `${
                type === "received" ? `Reject` : "Cancel"
              } friend request`,
              danger: true,
              onClick: (e) =>
                socket.emit("friendRequestRemoved", { userId: user._id }),
            },
          ],
        ]}
      />
    </li>
  )
}
const FriendRequests = ({
  user,
  friendRequests,
}: {
  user: User
  friendRequests: { transmitter: string; receiver: string }[]
}) => {
  const receivedFRs = useSelector(
    getUsersByIds(
      friendRequests
        .filter((friendRequest) => friendRequest.receiver === user._id)
        .map((friendRequest) => friendRequest.transmitter),
    ),
  )
  const transmittedFRs = useSelector(
    getUsersByIds(
      friendRequests
        .filter((friendRequest) => friendRequest.transmitter === user._id)
        .map((friendRequest) => friendRequest.receiver),
    ),
  )

  return (
    <section className="p-4 text-cspink-50 ">
      <div className="flex gap-2 items-center ">
        <h1 className="font-bold text-2xl">Friend requests</h1>
        {receivedFRs.length ? (
          <span className="inline-flex font-bold text-sm items-center justify-center bg-red-400 w-6 h-6 rounded-full p-2">
            {receivedFRs.length}
          </span>
        ) : null}
      </div>
      <Tab.Group>
        <Tab.List className="my-4 w-full grid grid-cols-2 text-xl border-csblue-300 border-b-2">
          <Tab
            className={({ selected }) =>
              `w-full p-4 font-bold text-csblue-50 ${
                selected
                  ? "font-bold text-cspink-50 border-cspink-200 border-b-2"
                  : null
              }`
            }
          >
            Received
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full p-4 font-bold text-csblue-50 ${
                selected
                  ? "font-bold text-cspink-50 border-cspink-200 border-b-2"
                  : null
              }`
            }
          >
            Transmitted
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            {receivedFRs.map((user) => (
              <FriendRequest type="received" user={user} />
            ))}
          </Tab.Panel>
          <Tab.Panel>
            {transmittedFRs.map((user) => (
              <FriendRequest type="transmitted" user={user} />
            ))}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </section>
  )
}

const Friend = ({ user }: { user: partialUser }) => {
  const DMs = useSelector(getDMs)
  const navigate = useNavigate()

  return (
    <li className="p-3 hover:border-0 border-b-2 font-semibold border-csblue-300 hover:rounded-md flex justify-between items-center hover:bg-csblue-100">
      <section className="flex gap-2">
        <span
          className="inline-block w-[2rem] aspect-square bg-csblue-400 rounded-full"
          style={{
            backgroundImage: `url(${user.avatar})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <span className="text-cspink-50 text-lg">{user.displayName}</span>
        <span className="text-csblue-50 text-lg">{user.username}</span>
      </section>
      <Menu
        placement="left"
        button={
          <button className="text-csblue-100 hover:text-csblue-50">
            <i className="bi bi-three-dots-vertical"></i>
          </button>
        }
        menuItems={[
          [
            {
              content: `Message @${user.username}`,
              onClick: (e) => {
                const DM = DMs.find((channel) =>
                  channel.recipients.includes(user._id),
                )
                if (DM) navigate(`/app/dms/${DM._id}`)
                else {
                  socket.emit("DMAdded", { userId: user._id })
                }
              },
            },
          ],
          [
            {
              content: `Unfriend @${user.username}`,
              danger: true,
              onClick: (e) =>
                socket.emit("friendRemoved", { userId: user._id }),
            },
            { content: `Block @${user.username}`, danger: true },
          ],
        ]}
      />
    </li>
  )
}

const Friends = () => {
  const user = useSelector((state: RootState) => state.user)
  const friends = useSelector(getUsersByIds(user.friends))

  const receivedFRs = useSelector(
    getUsersByIds(
      user.friendRequests
        .filter((friendRequest) => friendRequest.receiver === user._id)
        .map((friendRequest) => friendRequest.transmitter),
    ),
  )
  const transmittedFRs = useSelector(
    getUsersByIds(
      user.friendRequests
        .filter((friendRequest) => friendRequest.transmitter === user._id)
        .map((friendRequest) => friendRequest.receiver),
    ),
  )

  const [input, setInput] = useState("")
  return (
    <PageWrapper title="Friends">
      <main
        className={`max-w-screen overflow-x-hidden h-screen grid 
              grid-cols-[80px,_minmax(1rem,_1fr)]
           divide-x-[2px] divide-csblue-300`}
      >
        <Tab.Group>
          <Tab.List className="h-full p-3 flex justify-center flex-col gap-10">
            <Tab
              className={({ selected }) =>
                `p-2 hover:bg-blue-400 text-2xl text-blue-400 hover:text-cspink-50 aspect-square rounded-lg  ${
                  selected ? `bg-blue-300 !text-cspink-50` : null
                }`
              }
            >
              <i className="bi bi-person"></i>
            </Tab>
            <Tab className="">
              {({ selected }) =>
                selected ? (
                  <button
                    className={`aspect-square w-full hover:bg-green-400 text-2xl text-green-400 hover:text-cspink-50 rounded-lg  ${
                      selected ? `bg-green-300 !text-cspink-50` : null
                    }`}
                  >
                    <i className="bi bi-person-add"></i>
                  </button>
                ) : (
                  <PingIcon pingLength={receivedFRs.length}>
                    <button
                      className={`aspect-square w-full hover:bg-green-400 text-2xl text-green-400 hover:text-cspink-50 rounded-lg  ${
                        selected ? `bg-green-300 !text-cspink-50` : null
                      }`}
                    >
                      <i className="bi bi-person-add"></i>
                    </button>
                  </PingIcon>
                )
              }
            </Tab>
            <Tab
              className={({ selected }) =>
                `p-2 hover:bg-red-400 text-2xl text-red-400 hover:text-cspink-50 aspect-square rounded-lg  ${
                  selected ? `bg-red-300 !text-cspink-50` : null
                }`
              }
            >
              <i className="bi bi-person-x"></i>
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className="w-full p-4 flex flex-col gap-4">
              <h1 className="text-2xl font-bold text-cspink-50">Friends</h1>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="p-2 text-csblue-200 bg-csblue-400 rounded-md w-full"
                type="text"
                placeholder="Search for a friend.."
              />
              <ul>
                {friends
                  .filter((friend) => {
                    const regExp = RegExp(input.toLowerCase())
                    return (
                      regExp.test(friend.username.toLowerCase()) ||
                      regExp.test(friend.displayName.toLowerCase())
                    )
                  })
                  .map((friend) => (
                    <Friend user={friend} />
                  ))}
              </ul>
            </Tab.Panel>
            <Tab.Panel>
              <FriendRequests
                friendRequests={user.friendRequests}
                user={user}
              />
            </Tab.Panel>
            <Tab.Panel></Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <Outlet />
      </main>
    </PageWrapper>
  )
}

export default Friends
