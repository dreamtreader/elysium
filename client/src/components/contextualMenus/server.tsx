import { useDispatch } from "react-redux"
import MenuItems from "../contextualMenu"

import { openModalChanged } from "../redux/reducers/UIReducer"
import { Channel, Server } from "../../types"
import PermService from "../../lib/perms"
import { store } from "../redux/store"

export const ServerMenu = ({
  open,
  coordinates,
  className,
  server,
}: {
  open: boolean
  server: Server
  className?: string
  coordinates?: { x: number; y: number }
}) => {
  const dispatch = useDispatch()
  const perms = new PermService(store.getState())

  return (
    <MenuItems
      className={className}
      open={open}
      coordinates={coordinates}
      menuItems={[
        [
          {
            content: "Server Settings",
            condition: perms.isAbleTo("MANAGE_SERVER", server._id),
            onClick: (e) =>
              dispatch(
                openModalChanged({
                  type: "serverSettings",
                  entity: server._id,
                }),
              ),
          },
        ],
      ]}
    />
  )
}

export default ServerMenu
