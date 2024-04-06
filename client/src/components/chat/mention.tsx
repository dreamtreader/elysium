import { useSelector } from "react-redux"
import { CHANNEL_IDS } from "../../types"
import { getMemberByUserId } from "../redux/reducers/memberReducer"
import { getRoleById } from "../redux/reducers/roleReducer"
import { getUserById } from "../redux/reducers/chatReducer"

export const Mention = ({
  mention,
  channelType,
}: {
  mention: string
  channelType: number
}) => {
  const style: React.CSSProperties = {
    padding: "3px 3px 2px",
    margin: "0 1px",
    verticalAlign: "baseline",
    display: "inline-block",
    borderRadius: "4px",
    fontSize: "0.9em",
    backgroundColor: "rgba(80, 151, 247, 0.56)",
  }

  const user = useSelector(getUserById(mention))

  return (
    <span contentEditable={false} style={style}>
      <span className="text-cspink-50 opacity-100">
        @{user.username || "Not found"}
      </span>
    </span>
  )
}

export const MentionedRole = ({ mention }: { mention: string }) => {
  const role = useSelector(getRoleById(mention))

  const style: React.CSSProperties = {
    padding: "3px 3px 2px",
    margin: "0 1px",
    verticalAlign: "baseline",
    borderRadius: "4px",
    fontSize: "0.9em",
    backgroundColor: role.color ? role.color : "rgba(80, 151, 247, 0.56)",
  }

  return (
    <span contentEditable={false} style={style}>
      <span className="text-cspink-50 opacity-100">
        @{role.name || "Not found"}
      </span>
    </span>
  )
}
