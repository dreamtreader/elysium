import { useDispatch } from "react-redux"
import { openCropperChanged } from "../redux/reducers/UIReducer"
import { useEffect, useRef, useState } from "react"

const compressImage = async (file: File, { quality = 1, type = file.type }) => {
  // Get as image data
  const imageBitmap = await createImageBitmap(file)

  // Draw to canvas
  const canvas = document.createElement("canvas")
  canvas.width = imageBitmap.width
  canvas.height = imageBitmap.height
  const ctx = canvas.getContext("2d")
  ctx.drawImage(imageBitmap, 0, 0)

  // Turn into Blob
  const blob: BlobPart = await new Promise((resolve) =>
    canvas.toBlob(resolve, type, quality),
  )

  // Turn Blob into File
  return new File([blob], file.name, {
    type: file.type,
  })
}

const ProfileInput = ({
  src,
  className,
  setValue,
  penClassName,
  children,
}: {
  src?: string
  className?: string
  penClassName?: string
  setValue?: (value?: string) => any
  children?: React.ReactNode
}) => {
  const [fontSize, setFontSize] = useState("")
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(
    () =>
      setFontSize(
        (ref.current?.getBoundingClientRect().height * 40) / 100 + "px",
      ),
    [ref.current],
  )

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      {...(src && {
        style: {
          backgroundImage: `url(${src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        },
      })}
      className={`relative w-full aspect-square rounded-full cursor-pointer bg-csblue-400 hover:bg-csblue-300 ${className}`}
    >
      <button
        ref={ref}
        style={{
          fontSize: fontSize,
        }}
        className={`rounded-full absolute bg-cspink-200 text-cspink-50 w-[30%] aspect-square inline-flex justify-center items-center cursor-pointer left-full top-full translate-y-[-100%] translate-x-[-100%] ${penClassName}`}
      >
        <i className="bi bi-pen"></i>
      </button>
      {children}
      <input
        className="absolute z-100 w-full h-full opacity-0"
        type="file"
        accept="image/png, image/jpg, image/jpeg"
        onChange={async (e) => {
          if (e.target.files && e.target.files[0]) {
            /** const compressedFile = await compressImage(e.target.files[0], {
              // 0: is maximum compression
              // 1: is no compression
              quality: 0.5,

              type: "image/jpeg",
            }) **/

            setValue ? setValue(URL.createObjectURL(e.target.files[0])) : null
          }
        }}
      />
    </div>
  )
}

export default ProfileInput
