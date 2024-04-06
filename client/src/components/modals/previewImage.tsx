import Modal from "../../components/Modal"

import { useDispatch, useSelector } from "react-redux"
import {
  getPreviewedImage,
  resetPreviewedImage,
} from "../redux/reducers/UIReducer"

const PreviewImage = () => {
  const dispatch = useDispatch()

  const previewedImage = useSelector(getPreviewedImage())

  return (
    <Modal
      open={previewedImage.url !== ""}
      onClose={() => dispatch(resetPreviewedImage({}))}
    >
      <div className="w-full flex-col p-2">
        <img className="max-w-[90vw] max-h-[90vh]" src={previewedImage.url} />
        {previewedImage.uploaded ? (
          <button onClick={(e) => window.open(previewedImage.url)}>
            View image in browser
          </button>
        ) : null}
      </div>
    </Modal>
  )
}

export default PreviewImage
