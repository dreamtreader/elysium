import { partialUser } from "../../../types"
import { useState } from "react"

export const DataSection = ({
  firstRow,
  secondRow,
}: {
  firstRow: string
  secondRow: string
}) => {
  return (
    <div className="flex flex-col p-2">
      <h1 className="text-cspink-50 font-extrabold">{firstRow}</h1>
      <p className="text-csblue-50">{secondRow}</p>
    </div>
  )
}

export const Participant = ({ user }: { user: partialUser }) => {
  const [open, setOpen] = useState(false)
  const [contextualOpen, setContextualOpen] = useState(false)
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
  return (
    <>
      <div
        onClick={(e) => {
          if (open == false) {
            document.body.style.cursor = "pointer"
            e.stopPropagation()
            document.body.addEventListener(
              "click",
              (e) => {
                document.body.style.cursor = "auto"
                setOpen(false)
              },
              { once: true },
            )
          }
          setOpen(!open)
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setCoordinates({ x: e.pageX, y: e.pageY })
          setContextualOpen(true)
          window.addEventListener("click", (e) => {
            e.stopPropagation()
            setContextualOpen(false)
            window.removeEventListener("click", () => {})
          })
        }}
        className={`w-full ${
          !open
            ? "h-[3rem] max-h-[4rem] hover:bg-csblue-100 hover:text-csblue-50 bg-csblue-200"
            : "max-h-[35rem] bg-csblue-300"
        } relative transition-all ease-out duration-300 gap-2 text-lg text-csblue-100 rounded-md cursor-pointer shrink-0`}
      >
        {open ? (
          <div
            autoFocus={false}
            style={{
              backgroundImage: `url(${user.banner})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
            className="z-1 w-full aspect-video rounded-t-md w-full bg-csblue-500"
          />
        ) : null}
        <section
          className={`z-2 absolute ${
            open ? "left-2 top-2" : "left-0 top-0"
          } transition-all ease-out duration-300 p-2 rounded-md backdrop-blur-sm
          flex items-center gap-2 transition-all ease-out ${
            open ? "bg-csblue-700 bg-opacity-40" : null
          }`}
        >
          <span
            style={{
              backgroundImage: `url(${user.avatar})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="w-8 aspect-square bg-csblue-100 rounded-full"
          />
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="text-cspink-50 whitespace-nowrap text-ellipsis overflow-hidden">
              {user.displayName}
            </span>
            <span
              className={`text-sm font-medium ${
                open ? "text-csblue-50" : null
              } whitespace-nowrap text-ellipsis overflow-hidden`}
            >
              {open ? "@" + user.username : ""}
            </span>
          </div>
        </section>
        {open ? (
          <section className="p-2 flex flex-col gap-2">
            <div className="text-sm font-medium w-full bg-csblue-400 divide-y-[1px] divide-csblue-200 rounded-md p-2 flex flex-col">
              {user.status ? (
                <DataSection firstRow="STATUS" secondRow={user.status} />
              ) : null}
              <div>
                <DataSection
                  firstRow="CREATED AT"
                  secondRow={new Date(user.createdAt).toDateString()}
                />
              </div>
            </div>
            {user.status ? (
              <div className="text-sm font-medium w-full bg-csblue-400 divide-y-[1px] divide-csblue-200 rounded-md p-2 flex flex-col">
                <DataSection firstRow="ABOUT" secondRow="desc here.." />
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </>
  )
}

export default Participant
