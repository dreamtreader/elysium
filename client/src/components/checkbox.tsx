const Checkbox = ({
  checked,
  onChange,
  className,
}: {
  checked: boolean
  onChange: () => any
  className?: string
}) => {
  return (
    <span
      onClick={(e) => {
        e.preventDefault()
        onChange()
      }}
      className={`cursor-pointer text-cspink-50 w-4 h-4 font-bold flex justify-center items-center rounded-md ${
        checked ? "bg-cspink-200" : "border-cspink-200 border-[1px]"
      } ${className ?? ``}`}
    >
      {checked ? <i className="bi bi-check"></i> : null}
    </span>
  )
}

export default Checkbox
