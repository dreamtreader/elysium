import { useRef } from "react"
import Cropper, { ReactCropperElement } from "react-cropper"
import "cropperjs/dist/cropper.css"
import Modal from "./Modal"
import { useDispatch, useSelector } from "react-redux"
import { componentClosed, getOpenCropper } from "./redux/reducers/UIReducer"

const Crop = () => {
  const dispatch = useDispatch()
  const cropperRef = useRef<ReactCropperElement>(null)

  const cropperData = useSelector(getOpenCropper())

  const open = cropperData?.src.length > 0

  const cropFunc = () => {
    const cropper = cropperRef.current?.cropper
    if (cropperData.onCrop) {
      dispatch(componentClosed("openCropper"))
      cropperData.onCrop(cropper?.getCroppedCanvas().toDataURL())
    }
  }

  return (
    <Modal open={open}>
      <div>
        <div className="max-w-[30rem] max-h-[80vh] overflow-hidden rounded-md flex flex-col gap-4 justify-center p-4 items-center bg-csblue-200">
          <Cropper
            src={cropperData?.src}
            viewMode={2}
            // Cropper.js options
            width="80%"
            initialAspectRatio={cropperData?.aspectRatio || 1}
            aspectRatio={cropperData?.aspectRatio || 1}
            ref={cropperRef}
          />
        </div>
        <button
          onClick={(e) => cropFunc()}
          className="w-full min-w-1/2 p-2 bg-cspink-200 hover:bg-cspink-100 text-cspink-50 font-bold rounded-md"
        >
          Crop
        </button>
      </div>
    </Modal>
  )
}

export default Crop
