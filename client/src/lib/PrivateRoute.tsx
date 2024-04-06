import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../components/redux/store"
import Loading from "../routes/Loading"

const PrivateRoute = (props: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.user)
  const fetched = useSelector((state: RootState) => state.chat.fetched)

  if (!user.isSignedIn && user.attemptedLogin) return <Navigate to="/login" />
  else if (!fetched || !user.isSignedIn) return <Loading />
  return props.children
}

export default PrivateRoute
