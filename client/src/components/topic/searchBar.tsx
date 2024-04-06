import { useRef, useState } from "react"
import { Topic } from "../../types"
import { openModalChanged } from "../redux/reducers/UIReducer"
import Tooltip from "../tooltip"
import { useDispatch } from "react-redux"
import { store } from "../redux/store"
import { filterPosts } from "../redux/reducers/chatReducer"

export const SearchBar = ({
  topic,
  onChange,
  onSubmit,
}: {
  topic: Topic
  onChange?: (value: string) => any
  onSubmit?: any
}) => {
  const dispatch = useDispatch()
  const [usedInputs, setUsedInputs] = useState({})
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="w-full bg-csblue-300 flex gap-4 rounded-xl p-4 px-8">
      <input
        ref={inputRef}
        placeholder={`Search in @${topic.name}`}
        onKeyDown={(e) => {
          const input = inputRef.current?.value
          if (e.key == "Enter" && !usedInputs[input.trim()] && input) {
            const state = store.getState()
            const posts = filterPosts(input, topic._id)(state)
            if (posts.length < 10) onSubmit?.()
            onChange(input)
            setUsedInputs({ ...usedInputs, [input.trim()]: true })
          }
        }}
        className="text-csblue-100 px-4 bg-csblue-400 p-2 w-full rounded-md "
        type="text"
      />
      <div className="flex ">
        <Tooltip
          containerClassName="flex items-center rounded-md hover:bg-csblue-100 aspect-square px-2"
          placement="down"
          text={"Create post"}
        >
          <button
            onClick={(e) => dispatch(openModalChanged({ type: "postCreator" }))}
            className="font-bold text-cspink-200 text-2xl flex justify-center items-center "
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </Tooltip>
        <Tooltip
          containerClassName="flex items-center rounded-md hover:bg-csblue-100 aspect-square px-2"
          placement="down"
          text={"Sort options"}
        >
          <button
            onClick={(e) =>
              dispatch(openModalChanged({ type: "postFiltering" }))
            }
            className="font-bold text-cspink-200 text-2xl flex justify-center items-center "
          >
            <i className="bi bi-three-dots-vertical"></i>
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default SearchBar
