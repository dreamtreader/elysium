import { Popover, Transition } from "@headlessui/react"
import React, { Fragment, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

const textColors = [
  "text-gray-100",
  "text-gray-200",
  "text-gray-300",
  "text-gray-400",
  "text-gray-500",
  "text-gray-600",
  "text-gray-700",
  "text-gray-800",
  "text-red-100",
  "text-red-200",
  "text-red-300",
  "text-red-400",
  "text-red-500",
  "text-red-600",
  "text-red-700",
  "text-red-800",
  "text-orange-100",
  "text-orange-200",
  "text-orange-300",
  "text-orange-400",
  "text-orange-500",
  "text-orange-600",
  "text-orange-700",
  "text-orange-800",
  "text-yellow-100",
  "text-yellow-200",
  "text-yellow-300",
  "text-yellow-400",
  "text-yellow-500",
  "text-yellow-600",
  "text-yellow-700",
  "text-yellow-800",

  "text-green-100",
  "text-green-200",
  "text-green-300",
  "text-green-400",
  "text-green-500",
  "text-green-600",
  "text-green-700",
  "text-green-800",

  "text-emerald-100",
  "text-emerald-200",
  "text-emerald-300",
  "text-emerald-400",
  "text-emerald-500",
  "text-emerald-600",
  "text-emerald-700",
  "text-emerald-800",

  "text-sky-100",
  "text-sky-200",
  "text-sky-300",
  "text-sky-400",
  "text-sky-500",
  "text-sky-600",
  "text-sky-700",
  "text-sky-800",

  "text-blue-100",
  "text-blue-200",
  "text-blue-300",
  "text-blue-400",
  "text-blue-500",
  "text-blue-600",
  "text-blue-700",
  "text-blue-800",

  "text-violet-100",
  "text-violet-200",
  "text-violet-300",
  "text-violet-400",
  "text-violet-500",
  "text-violet-600",
  "text-violet-700",
  "text-violet-800",
  "text-purple-100",
  "text-purple-200",
  "text-purple-300",
  "text-purple-400",
  "text-purple-500",
  "text-purple-600",
  "text-purple-700",
  "text-purple-800",

  "text-pink-100",
  "text-pink-200",
  "text-pink-300",
  "text-pink-400",
  "text-pink-500",
  "text-pink-600",
  "text-pink-700",
  "text-pink-800",
  "text-rose-100",
  "text-rose-200",
  "text-rose-300",
  "text-rose-400",
  "text-rose-500",
  "text-rose-600",
  "text-rose-700",
  "text-rose-800",
]

const ColorSelector = ({
  children,
  onSelect,
}: {
  children: React.ReactNode
  onSelect?: (value: string) => any
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [recentColors, setRecentColors] = useState([])

  const colors = useMemo(
    () => [
      "bg-gray-100",
      "bg-gray-200",
      "bg-gray-300",
      "bg-gray-400",
      "bg-gray-500",
      "bg-gray-600",
      "bg-gray-700",
      "bg-gray-800",
      "bg-red-100",
      "bg-red-200",
      "bg-red-300",
      "bg-red-400",
      "bg-red-500",
      "bg-red-600",
      "bg-red-700",
      "bg-red-800",
      "bg-orange-100",
      "bg-orange-200",
      "bg-orange-300",
      "bg-orange-400",
      "bg-orange-500",
      "bg-orange-600",
      "bg-orange-700",
      "bg-orange-800",
      "bg-yellow-100",
      "bg-yellow-200",
      "bg-yellow-300",
      "bg-yellow-400",
      "bg-yellow-500",
      "bg-yellow-600",
      "bg-yellow-700",
      "bg-yellow-800",

      "bg-green-100",
      "bg-green-200",
      "bg-green-300",
      "bg-green-400",
      "bg-green-500",
      "bg-green-600",
      "bg-green-700",
      "bg-green-800",

      "bg-emerald-100",
      "bg-emerald-200",
      "bg-emerald-300",
      "bg-emerald-400",
      "bg-emerald-500",
      "bg-emerald-600",
      "bg-emerald-700",
      "bg-emerald-800",

      "bg-sky-100",
      "bg-sky-200",
      "bg-sky-300",
      "bg-sky-400",
      "bg-sky-500",
      "bg-sky-600",
      "bg-sky-700",
      "bg-sky-800",

      "bg-blue-100",
      "bg-blue-200",
      "bg-blue-300",
      "bg-blue-400",
      "bg-blue-500",
      "bg-blue-600",
      "bg-blue-700",
      "bg-blue-800",

      "bg-violet-100",
      "bg-violet-200",
      "bg-violet-300",
      "bg-violet-400",
      "bg-violet-500",
      "bg-violet-600",
      "bg-violet-700",
      "bg-violet-800",
      "bg-purple-100",
      "bg-purple-200",
      "bg-purple-300",
      "bg-purple-400",
      "bg-purple-500",
      "bg-purple-600",
      "bg-purple-700",
      "bg-purple-800",

      "bg-pink-100",
      "bg-pink-200",
      "bg-pink-300",
      "bg-pink-400",
      "bg-pink-500",
      "bg-pink-600",
      "bg-pink-700",
      "bg-pink-800",
      "bg-rose-100",
      "bg-rose-200",
      "bg-rose-300",
      "bg-rose-400",
      "bg-rose-500",
      "bg-rose-600",
      "bg-rose-700",
      "bg-rose-800",
    ],
    [],
  )
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button ref={buttonRef}>{children}</Popover.Button>
          {createPortal(
            <Transition
              show={open}
              style={{
                position: "absolute",
                left: buttonRef.current?.getBoundingClientRect().left + "px",
                top: buttonRef.current?.getBoundingClientRect().top - 20 + "px",
                zIndex: 200,
              }}
              className="ml-10"
              as="div"
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel
                onClick={(e) => e.stopPropagation()}
                className="z-[200] w-52 rounded shadow-[rgba(0,_0,_0,_0.35)_0px_5px_15px] bg-csblue-300 p-2 flex flex-col items-center"
              >
                <section>
                  <h1 className="self-start">Recently used</h1>
                  <section className="grid gap-x-2 gap-y-2 grid-cols-8 justify-center items-center">
                    {recentColors.map((color) => (
                      <span
                        onClick={(e) => {
                          onSelect(color)
                          var newRecentColors = recentColors.filter(
                            (color) => color != color,
                          )
                          newRecentColors = [color, ...newRecentColors]
                          if (newRecentColors.length > 6)
                            newRecentColors.shift()

                          setRecentColors(newRecentColors)
                        }}
                        className={`w-4 cursor-pointer aspect-square rounded ${color}`}
                      />
                    ))}
                  </section>
                </section>
                <div className="w-full h-[1px] my-2 bg-csblue-150 " />
                <section className="grid gap-x-2 gap-y-2 grid-cols-8 justify-center items-center">
                  {colors.map((color) => (
                    <span
                      onClick={(e) => {
                        onSelect(color)
                        if (recentColors.length <= 20) {
                          const newRecentColors = [color, ...recentColors]
                          setRecentColors(newRecentColors)
                        } else {
                          const newRecentColors = [color, ...recentColors]
                          newRecentColors.shift()
                          setRecentColors(newRecentColors)
                        }
                      }}
                      className={`w-4 cursor-pointer aspect-square rounded ${color}`}
                    />
                  ))}
                </section>
              </Popover.Panel>
            </Transition>,
            document.getElementById("headlessui-portal-root"),
          )}
        </>
      )}
    </Popover>
  )
}

export default ColorSelector
