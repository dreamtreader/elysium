import { MenuItem } from "../types"
import { Transition, Menu } from "@headlessui/react"
import { Fragment } from "react"

const placements: { [index: string]: string } = {
  left: "top-[50%] translate-y-[-50%] right-[100%]",
  right: "top-[50%] translate-y-[-50%] left-[100%]",
  up: "left-[50%] translate-x-[-50%] bottom-[100%]",
  down: "left-[50%] translate-x-[-50%] top-[100%]",
}

export const MenuComp = ({
  menuItems,
  containerClassName,
  buttonClassName,
  className,
  button,
  placement = "right",
}: {
  menuItems: Array<MenuItem[]>
  containerClassName?: string
  className?: string
  buttonClassName?: string
  button: JSX.Element | ((open: boolean) => JSX.Element)
  placement?: string
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
      className={`relative inline-block text-left ${containerClassName}`}
    >
      {({ open }) => (
        <>
          <Menu.Button
            onClick={(e) => e.stopPropagation()}
            className={buttonClassName}
          >
            {typeof button == "function" ? button(open) : button}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`absolute z-[200] mt-2 w-56 divide-y divide-csblue-200 rounded-md bg-csblue-500 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${placements[placement]} ${className}`}
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
        </>
      )}
    </Menu>
  ) : null
}

export default MenuComp
