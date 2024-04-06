import { useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../components/redux/store"
import { LoadChatData, loginByToken } from "../lib/DB"

import { useDispatch } from "react-redux"

const facts = [
  "Elysium was founded by an admirer of flowers. Pretty obvious by the logo, right?",
  "Some people have chatted enough with their acquaintances for their records to make up tens of authentic books!",
  'Elysium means "paradise", which is why we chose this name for our platform - its origin bloomed from an ethereal place guarded by a pink sky, a garden and a person as pure as flowers',
]

const Loading = () => {
  let index = Math.floor(Math.random() * facts.length)
  const user = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    document.title = "Loading.."
    if (!user.isSignedIn) loginByToken(dispatch)
    LoadChatData(dispatch)
  }, [])
  return (
    <main className="w-screen h-screen bg-csblue-200 flex flex-col gap-4 justify-center items-center p-8">
      <div className="w-20 aspect-square p-2 bg-cspink-200 flex items-center justify-center icon">
        <span
          style={{
            backgroundImage: "url(/Elysium.svg)",
            backgroundSize: "cover",
          }}
          className="w-full p-4 rounded-lg aspect-square"
        />
      </div>
      <div className="flex flex-col gap-4 justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <h1 className="m-none font-bold text-cspink-50 text-2xl">
            Fun fact:
          </h1>
          <h2 className="text-center m-none font-semibold text-cspink-50 text-lg">
            {facts[index]}
          </h2>
        </div>
      </div>
    </main>
  )
}

export default Loading
