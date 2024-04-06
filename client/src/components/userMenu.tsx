import { useDispatch } from "react-redux"
import { User } from "../types"
import Menu from "./menu"
import { openModalChanged } from "./redux/reducers/UIReducer"
import UserIcon from "./userIcon"
import { Logout } from "../lib/DB"
export const userMenu = ({ user }: { user: User }) => {
  const dispatch = useDispatch()
  return (
    <div className="flex flex-col justify-center items-center">
      <Menu
        button={
          <UserIcon
            user={user}
            className="w-16 h-16 aspect-square icon bg-csblue-400"
          />
        }
        menuItems={[
          [
            {
              content: "Change status",
              onClick: (e) =>
                dispatch(openModalChanged({ type: "changeStatus" })),
            },
          ],
          [
            {
              content: "Settings",
              onClick: (e) =>
                dispatch(openModalChanged({ type: "userSettings" })),
            },
            {
              content: "Log out",
              danger: true,
              onClick: async (e) => await Logout(dispatch),
            },
          ],
        ]}
      />
      <div className="flex flex-col justify-center overflow-hidden items-center"></div>
      <div className="w-full text-cspink-50 flex flex-col justify-center items-center text-md text-ellipsis">
        <span className="font-bold">{user.displayName}</span>
      </div>
    </div>
  )
}

export default userMenu
