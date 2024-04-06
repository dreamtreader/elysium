import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../redux/store"
import { Tab } from "@headlessui/react"
import { useState } from "react"
import ProfileInput from "../../input/profileInput"
import { useEffect } from "react"
import Crop from "../../crop"
import { saveChangesOpened } from "../../redux/reducers/UIReducer"
import { socket } from "../../../socket/socketInitializer"
import {
  componentClosed,
  isActive,
  openCropperChanged,
} from "../../redux/reducers/UIReducer"

import SaveChanges from "../saveChangesNew"
import { User } from "../../../types"
import { getSelfMembers } from "../../redux/reducers/memberReducer"
import Menu from "../../menu"
import ColorInput from "../../input/colorInput"

const UserProfile = ({ user }: { user: User }) => {
  const [initialFormState, setInitialFormState] = useState({
    displayName: user.displayName,
    username: user.username,
    avatar: user.avatar,
    banner: user.banner,
  })
  const members = useSelector(getSelfMembers)
  const dispatch = useDispatch()
  const [formState, setFormState] = useState(initialFormState)

  const saveChangesOpen = useSelector(isActive(true, "saveChanges"))

  useEffect(() => {
    const edited = ["displayName", "username", "avatar", "banner"].find(
      (field) => initialFormState[field] !== formState[field],
    )
    if (edited && !saveChangesOpen) {
      dispatch(saveChangesOpened(true))
    }
    if (saveChangesOpen && !edited?.length)
      dispatch(componentClosed("saveChanges"))
  }, [formState])

  useEffect(() => console.log(members), [])
  return (
    <>
      <div
        className="w-full bg-csblue-300
  transition-all ease-out duration-300 gap-2 text-lg text-csblue-100
  rounded-md shrink-0"
      >
        <ProfileInput
          className="z-1 w-full aspect-video rounded-t-md bg-csblue-500 rounded-none"
          penClassName="w-[3rem]"
          {...(formState.banner && { src: formState.banner })}
          setValue={(value) => {
            dispatch(
              openCropperChanged({
                src: value,
                aspectRatio: 16 / 9,
                onCrop: (value: string) => {
                  setFormState({
                    ...formState,
                    banner: value,
                  })
                },
              }),
            )
          }}
        >
          <section
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 300 }}
            className={`absolute mt-4 ml-4 z-2 transition-all ease-out duration-300 p-4 rounded-md backdrop-blur-sm
flex items-center gap-2 transition-all ease-out 
  bg-csblue-700 bg-opacity-40
`}
          >
            <ProfileInput
              className="!w-20 !z-200"
              penClassName="text-sm"
              {...(formState.avatar && { src: formState.avatar })}
              setValue={(value) => {
                dispatch(
                  openCropperChanged({
                    src: value,
                    aspectRatio: 1,
                    onCrop: (value: string) => {
                      setFormState({
                        ...formState,
                        avatar: value,
                      })
                    },
                  }),
                )
              }}
            />
            <div className="flex flex-col justify-center overflow-hidden">
              <span className="text-cspink-50 whitespace-nowrap text-ellipsis overflow-hidden text-2xl">
                {formState.displayName}
              </span>
              <span
                className={`text-xl 
             text-csblue-50
           whitespace-nowrap text-ellipsis overflow-hidden`}
              >
                {"@" + formState.username}
              </span>
            </div>
          </section>
        </ProfileInput>

        <section className="p-2 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="displayName"
              className="text-cspink-200 font-bold text-lg"
            >
              DISPLAY NAME
            </label>

            <input
              type="text"
              value={formState.displayName}
              maxLength={50}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  displayName: e.target.value,
                })
              }
              name="displayName"
              className="bg-csblue-400 rounded-md p-2 text-csblue-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-cspink-200 font-bold text-lg"
            >
              USERNAME
            </label>

            <input
              type="text"
              value={formState.username}
              maxLength={50}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  username: e.target.value,
                })
              }
              name="username"
              className="bg-csblue-400 rounded-md p-2 text-csblue-100"
            />
          </div>
        </section>
      </div>
      <SaveChanges
        onSave={() => {
          socket.emit("userChanged", formState)

          socket.once("userChanged", (user) => {
            setInitialFormState({
              displayName: user.displayName,
              username: user.username,
              avatar: user.avatar,
              banner: user.banner,
            })
          })
        }}
        onReset={() => setFormState(initialFormState)}
      />
    </>
  )
}

const ServerProfiles = () => {
  const members = useSelector(getSelfMembers)
  const servers = useSelector((state: RootState) => state.chat.servers)

  const [formState, setFormState] = useState(members)
  const [activeMemberId, setActiveMemberId] = useState(
    Object.keys(formState)[0],
  )
  const dispatch = useDispatch()
  const saveChangesOpen = useSelector(isActive(true, "saveChanges"))

  useEffect(() => {
    const edited = ["displayName", "username", "avatar"].find(
      (field) =>
        members[activeMemberId][field] !== formState[activeMemberId][field],
    )
    if (edited && !saveChangesOpen) {
      dispatch(saveChangesOpened(true))
    }
    if (saveChangesOpen && !edited?.length)
      dispatch(componentClosed("saveChanges"))
  }, [formState])

  return (
    <div className="overflow-y-auto flex flex-col gap-2">
      <div className="items-start flex flex-col gap-1">
        <label className="text-cspink-200 font-bold text-lg">SERVER</label>
        <Menu
          containerClassName="w-full"
          placement={"down"}
          buttonClassName="w-full"
          className="bg-csblue-700 w-full left-[0%]"
          button={(open) => (
            <button
              className={`bg-csblue-400 text-left w-full rounded-md p-2 text-csblue-100 ${
                open ? `border-blue-200 border-1` : null
              }`}
            >
              {servers[members[activeMemberId].serverId].name}
            </button>
          )}
          menuItems={[
            Object.values(members).map((member) => ({
              content: servers[member.serverId].name,
              onClick: () => setActiveMemberId(member._id),
            })),
          ]}
        />
      </div>
      <div className="items-start flex flex-col gap-1">
        <label className="text-cspink-200 font-bold text-lg">PREVIEW</label>

        <div
          className="w-full bg-csblue-300
  transition-all ease-out duration-300 gap-2 text-lg text-csblue-100
  rounded-md shrink-0"
        >
          <ProfileInput
            className="z-1 aspect-video w-full rounded-t-md w-full bg-csblue-500 rounded-none"
            penClassName="w-[3rem] cursor-pointer"
            {...(formState[activeMemberId].banner && {
              src: formState[activeMemberId].banner,
            })}
            setValue={(value) => {
              dispatch(
                openCropperChanged({
                  src: value,
                  aspectRatio: 16 / 9,
                  onCrop: (value: string) => {
                    setFormState({
                      ...formState,
                      [activeMemberId]: {
                        ...formState[activeMemberId],
                        banner: value,
                      },
                    })
                  },
                }),
              )
            }}
          >
            <section
              className={`z-2 mt-4 ml-4 absolute transition-all ease-out duration-300 p-4 rounded-md backdrop-blur-sm
flex items-center gap-2 transition-all ease-out 
  bg-csblue-700 bg-opacity-40
`}
            >
              <ProfileInput
                className="!w-20"
                penClassName="text-xs cursor-pointer"
                {...(formState[activeMemberId].avatar && {
                  src: formState[activeMemberId].avatar,
                })}
                setValue={(value) => {
                  dispatch(
                    openCropperChanged({
                      src: value,
                      aspectRatio: 1,
                      onCrop: (value: string) => {
                        setFormState({
                          ...formState,
                          [activeMemberId]: {
                            ...formState[activeMemberId],
                            avatar: value,
                          },
                        })
                      },
                    }),
                  )
                }}
              />
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-cspink-50 whitespace-nowrap text-ellipsis overflow-hidden text-2xl">
                  {formState[activeMemberId].displayName}
                </span>
                <span
                  className={`text-xl 
             text-csblue-50
           whitespace-nowrap text-ellipsis overflow-hidden`}
                >
                  {"@" + formState[activeMemberId].username}
                </span>
              </div>
            </section>
          </ProfileInput>

          <section className="p-2 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="displayName"
                className="text-cspink-200 font-bold text-lg"
              >
                DISPLAY NAME
              </label>

              <input
                type="text"
                value={formState[activeMemberId].displayName}
                maxLength={50}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    [activeMemberId]: {
                      ...formState[activeMemberId],
                      displayName: e.target.value,
                    },
                  })
                }
                name="displayName"
                className="bg-csblue-400 rounded-md p-2 text-csblue-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="username"
                className="text-cspink-200 font-bold text-lg"
              >
                USERNAME
              </label>

              <input
                type="text"
                value={formState[activeMemberId].username}
                maxLength={50}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    [activeMemberId]: {
                      ...formState[activeMemberId],
                      username: e.target.value,
                    },
                  })
                }
                name="username"
                className="bg-csblue-400 rounded-md p-2 text-csblue-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="primaryColor"
                className="text-cspink-200 font-bold text-lg"
              >
                PRIMARY COLOR
              </label>
              <ColorInput className="" value="#FFFFFF" />
            </div>
          </section>
        </div>
      </div>
      <SaveChanges
        onSave={() =>
          socket.emit("selfMemberChanged", formState[activeMemberId])
        }
        onReset={() => setFormState(members)}
      />
    </div>
  )
}

const Profile = () => {
  const user = useSelector((state: RootState) => state.user)

  return (
    <div className="max-w-[740px] min-h-[460px] max-h-screen overflow-y-auto grow shrink h-full px-[60px] pt-20">
      <Tab.Group>
        <Tab.List className="w-full flex gap-2 border-csblue-300 border-b-2">
          <Tab
            className={({ selected }) =>
              `w-full p-4 font-bold text-csblue-50 ${
                selected
                  ? "font-bold text-cspink-50 border-cspink-200 border-b-2"
                  : null
              }`
            }
          >
            User Profile
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
            Server Profiles
          </Tab>
        </Tab.List>
        <Tab.Panels className="">
          <Tab.Panel className="py-2 gap-2 flex flex-col">
            <UserProfile user={user} />
          </Tab.Panel>
          <Tab.Panel className="py-2 gap-2 flex flex-col">
            <ServerProfiles />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <Crop />
    </div>
  )
}

export default Profile
