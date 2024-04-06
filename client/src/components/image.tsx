import { useDispatch } from "react-redux"
import { previewedImageChanged } from "./redux/reducers/UIReducer"

export const Image = ({
  URL,
  className,
  uploaded = false,
}: {
  URL: string
  className?: string
  uploaded?: boolean
}) => {
  const dispatch = useDispatch()

  return (
    <img
      onClick={(e) =>
        dispatch(previewedImageChanged({ url: URL, uploaded: uploaded }))
      }
      className={`cursor-pointer ${className}`}
      src={URL}
    />
  )
}

export default Image
