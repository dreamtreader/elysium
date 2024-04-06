import { ReactNode } from "react"
const PingIcon = ({
  className,
  children,
  pingLength,
}: {
  className?: string
  children?: ReactNode
  pingLength: number
}) => {
  return (
    <div className="relative w-full h-full flex justify-center items-center">
      {children ? (
        children
      ) : (
        <span
          style={{
            backgroundImage: `url()`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className={`inline-flex justify-center items-center w-8 aspect-square rounded-full bg-csblue-400 ${className}`}
        />
      )}
      {pingLength !== 0 ? (
        <span className="absolute top-[100%] left-[100%] translate-x-[-80%] translate-y-[-80%] text-[0.6rem] font-bold inline-flex justify-center items-center text-cspink-50 bg-red-400 w-5 translate-y-[-10%] border-csblue-400 border-2 aspect-square rounded-full">
          {pingLength <= 99 ? pingLength : "99+"}
        </span>
      ) : null}
    </div>
  )
}

export default PingIcon
