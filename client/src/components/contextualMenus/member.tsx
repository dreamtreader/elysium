import { useNavigate } from "react-router-dom"
import { Member } from "../../types"
import MenuItems from "../contextualMenu"
import { getDMs, getUserById } from "../redux/reducers/chatReducer"
import { useSelector } from "react-redux"
import { socket } from "../../socket/socketInitializer"
import { RootState } from "../redux/store"
export const MemberMenu = ({
  open,
  coordinates,
  className,
  member,
}: {
  open: boolean
  className?: string
  coordinates?: { x: number; y: number }
  member: Member
}) => {
  const selfUser = useSelector((state: RootState) => state.user)
  const friends: string[] = useSelector(
    (state: RootState) => state.user.friends,
  )
  const user = useSelector(getUserById(member.userId))
  const DMs = useSelector(getDMs)

  const navigate = useNavigate()

  return (
    <MenuItems
      className={className}
      open={open}
      coordinates={coordinates}
      menuItems={[
        [
          {
            content: `Message @${user.username}`,
            condition: user._id !== selfUser._id,
            onClick: (e) => {
              const DM = DMs.find((channel) =>
                channel.recipients.includes(member.userId),
              )

              if (DM) navigate(`/app/dms/${DM._id}`)
              else {
                socket.emit("DMAdded", { userId: member.userId })
              }
            },
          },
        ],
        [
          {
            content: `Friend @${user.username}`,
            condition: !friends.includes(user._id) && user._id !== selfUser._id,
            onClick: (e) => {
              socket.emit("friendRequestAdded", { userId: member.userId })
            },
          },
          {
            content: `Block @${user.username}`,
            danger: true,
            condition: user._id !== selfUser._id,
            onClick: (e) => {
              socket.emit("userBlocked", { userId: member.userId })
            },
          },
        ],
      ]}
    />
  )
}

export default MemberMenu
