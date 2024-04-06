import Tooltip from "../../components/tooltip"

const MenuButton = ({
  icon,
  text,
  onClick,
}: {
  icon?: JSX.Element
  text: string
  onClick?: (e: any, text?: string) => void
}) => {
  return (
    <Tooltip placement="up" text={text}>
      <button
        onClick={(e) => (onClick ? onClick(e, text) : null)}
        className="text-2xl text-cspink-200 hover:text-cspink-50 hover:bg-cspink-100 transition-all duration-200 ease-out w-full aspect-square rounded-md bg-csblue-300"
      >
        {icon
          ? icon
          : text
              .toUpperCase()
              .split(" ")
              .map((string) => string.charAt(0))}
      </button>
    </Tooltip>
  )
}

export default MenuButton
