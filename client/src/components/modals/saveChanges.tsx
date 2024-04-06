import React from "react"
import { SnackbarContent, CustomContentProps, useSnackbar } from "notistack"
import { useDispatch } from "react-redux"
import { componentClosed } from "../redux/reducers/UIReducer"

interface saveChangesProps extends CustomContentProps {
  onSave: (finalObject: any) => any
  onReset: (initialObject: any) => any
  initialObject: any
  finalObject: any
}

const SaveChanges = React.forwardRef<HTMLDivElement, saveChangesProps>(
  (
    { style, onSave, onReset, initialObject, finalObject, ...otherProps },
    ref,
  ) => {
    const { closeSnackbar } = useSnackbar()
    const dispatch = useDispatch()
    return (
      <SnackbarContent
        role={"alert"}
        ref={ref}
        style={style}
        id="saveChanges"
        className="rounded-md w-[50vw] flex justify-between items-center text-cspink-50 p-2 bg-csblue-500"
      >
        <p>Don't forget - You've got unsaved changes!</p>
        <div className="flex gap-2 flex-col sm:flex-row">
          <button
            style={{ zIndex: 120 }}
            onClick={(e) => {
              onReset(initialObject)
              closeSnackbar("saveChanges")
              dispatch(componentClosed("saveChanges"))
            }}
            className="p-2 text-cspink-200 rounded-md border-2 border-cspink-200 hover:border-cspink-100 hover:text-cspink-100"
          >
            Reset
          </button>
          <button
            onClick={(e) => {
              onSave(finalObject)
              closeSnackbar("saveChanges")
              dispatch(componentClosed("saveChanges"))
            }}
            className="p-2 text-cspink-50 rounded-md bg-cspink-200 hover:bg-cspink-100"
          >
            Save
          </button>
        </div>
      </SnackbarContent>
    )
  },
)

export default SaveChanges
