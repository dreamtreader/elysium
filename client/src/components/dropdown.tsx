import { useEffect, useRef } from "react"
import React from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  componentClosed,
  isActive,
  openDropdownChanged,
} from "./redux/reducers/UIReducer"
import { createPortal } from "react-dom"
const Dropdown = ({
  items,
  setValue,
  children,
}: {
  items: string[] | Object[]
  setValue?: (value: (typeof items)[0]) => any
  children: React.ReactNode
}) => {
  const dispatch = useDispatch()
  const contentRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)

  const open = useSelector(isActive(true, "openDropdown"))

  useEffect(() => {
    if (contentRef.current && dropdownRef.current) {
      const bounds = contentRef.current.getBoundingClientRect()
      const width = contentRef.current.clientWidth
      dropdownRef.current.style.width = `${width}px`
      dropdownRef.current.style.top = `${bounds.top + window.scrollY}px`
      dropdownRef.current.style.left = `${bounds.left + window.scrollX}px`
    }
  }, [contentRef.current, dropdownRef.current])

  return (
    <>
      <div
        ref={contentRef}
        onClick={(e) => {
          dispatch(openDropdownChanged(true))
          e.stopPropagation()
          e.preventDefault()
          window.addEventListener("click", (e) => {
            e.stopPropagation()
            dispatch(componentClosed("openDropdown"))
            window.removeEventListener("click", () => {})
          })
        }}
      >
        {children}
      </div>
      {open
        ? createPortal(
            <ul className="absolute bg-csblue-400" ref={dropdownRef}>
              {items.map((item: string | Object) => (
                <li
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setValue(item)
                  }}
                  className="p-2 hover:bg-csblue-300 text-csblue-200"
                >
                  {typeof item == "string"
                    ? item
                    : "displayValue" in item
                    ? item[item.displayValue as string]
                    : null}
                </li>
              ))}
            </ul>,
            document.getElementById("root"),
          )
        : null}
    </>
  )
}

export default Dropdown
