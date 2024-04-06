import { Menu, Transition } from "@headlessui/react"
import { MenuItem } from "../types"
import { Fragment } from "react"
export const MenuItems = ({
  menuItems,
  className,
  coordinates,
  open,
}: {
  menuItems: MenuItem[][]
  className?: string
  coordinates?: { x: number; y: number }
  open: boolean
}) => {
  const canInherentlySee = menuItems.reduce((accumulator, currentValue) => {
    return (
      accumulator ||
      currentValue.reduce((newAccumulator, currentValue) => {
        return newAccumulator || (currentValue.condition ?? true)
      }, false)
    )
  }, false)

  return canInherentlySee ? (
    <Menu
      as="div"
      style={{
        top: coordinates ? coordinates.y + "px" : 0,
        left: coordinates ? coordinates.x + "px" : 0,
      }}
      className={` absolute z-20`}
    >
      <Transition
        as={Fragment}
        show={open}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute z-[200] mt-2 w-56 divide-y divide-csblue-200 rounded-md bg-csblue-500 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${className}`}
        >
          {menuItems.map((menuItems) => (
            <div className="px-1 py-1 ">
              {menuItems.map((menuItem) => {
                if (menuItem.condition == false) return null
                return (
                  <Menu.Item>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={(e) => menuItem.onClick?.(e)}
                        className={` ${
                          active
                            ? menuItem.danger
                              ? "bg-red-500 text-cspink-50"
                              : "bg-cspink-200 text-cspink-50"
                            : menuItem.danger
                            ? "text-red-500"
                            : "text-csblue-100"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {menuItem.content}
                      </button>
                    )}
                  </Menu.Item>
                )
              })}
            </div>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  ) : null
}

export default MenuItems
