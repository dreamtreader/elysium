import Modal from "../../../components/Modal"
import { Listbox } from "@headlessui/react"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { isActive, componentClosed } from "../../redux/reducers/UIReducer"

import { RootState } from "../../redux/store"
import { postSortFieldChanged } from "../../redux/reducers/chatReducer"

const sortChoices = {
  createdAt: "Creation date",
  likes: "Number of likes",
  views: "Number of views",
}

const PostFiltering = () => {
  const dispatch = useDispatch()

  const open = useSelector(isActive("postFiltering", "openModal"))
  const sortField = useSelector((state: RootState) => state.chat.postSortField)

  return (
    <Modal open={open} onClose={() => dispatch(componentClosed("openModal"))}>
      <div className="bg-csblue-200 flex flex-col gap-4 w-screen max-w-md p-5 rounded-md">
        <h1 className="text-2xl font-bold text-cspink-50">
          How do you want your post searches sorted?
        </h1>
        <Listbox
          value={sortField}
          onChange={(e) => dispatch(postSortFieldChanged(e))}
        >
          <Listbox.Button className=" bg-cspink-200 rounded-md p-2 text-cspink-50 font-bold">
            {sortChoices[sortField]}
          </Listbox.Button>
          <Listbox.Options className="p-1 bg-csblue-400 text-csblue-50 font-bold rounded-md">
            {Object.entries(sortChoices).map(([value, name]) => (
              <Listbox.Option
                className={({ active }) =>
                  `${
                    active ? `text-cspink-200 bg-csblue-200 rounded-md` : ``
                  } p-2 cursor-pointer`
                }
                key={value}
                value={value}
              >
                {({ selected }) => (
                  <span className="flex justify-between">
                    {name}
                    {selected ? <i className="bi bi-check-lg"></i> : null}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>
    </Modal>
  )
}

export default PostFiltering
