import { useEffect, ReactNode, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { activeCategoryChanged } from "../components/redux/reducers/chatReducer"
import {
  getTotalDMPings,
  getTotalServerPings,
} from "../components/redux/reducers/pingReducer"
import { useSelector } from "react-redux"
import { RootState } from "../components/redux/store"
const categories = ["friends", "dms", "servers"]
export const PageWrapper = ({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) => {
  const location = useLocation()
  const dispatch = useDispatch()

  const DMPings = useSelector(getTotalDMPings).length
  const serverPings = useSelector(getTotalServerPings).length
  const friendRequests = useSelector(
    (state: RootState) =>
      state.user.friendRequests.filter(
        (friendRequest) => friendRequest.receiver === state.user._id,
      ).length,
  )

  const notifications = useMemo(
    () => DMPings + serverPings + friendRequests,
    [DMPings, serverPings, friendRequests],
  )

  useEffect(() => {
    document.title =
      (notifications > 0 ? `(${notifications}) ` : "") +
      (title ? `Elysium | ${title}` : `Elysium`)
  }, [title, notifications])

  useEffect(() => {
    categories.forEach((category: string) => {
      if (location.pathname.includes(category)) {
        dispatch(activeCategoryChanged(category))
      }
    })
  }, [location.pathname, title])
  return children
}

export default PageWrapper
