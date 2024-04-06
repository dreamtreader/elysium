const ColorInput = ({
  value,
  onChange,
  className = "",
}: {
  value?: string
  onChange?: (color: string) => any
  className: string
}) => {
  return (
    <div className="relative w-full h-full">
      <input
        {...(value && { value: value })}
        onChange={(e) => onChange(e.target.value)}
        className="z-[200] w-4 h-4 absolute opacity-0"
        type="color"
      />
      <div className={className} />
    </div>
  )
}

export default ColorInput
