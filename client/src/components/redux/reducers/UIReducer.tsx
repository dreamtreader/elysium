import { createSlice, createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { UIState, componentName } from "../../../types"

const initialState: UIState = {
  previewedImage: {
    url: "",
    uploaded: false,
  },
}

export const UIReducer = createSlice({
  name: "UI",
  initialState,
  reducers: {
    loggedOut(state, action) {
      return initialState
    },
    openModalChanged(state, action) {
      state.openModal = action.payload
    },
    searchOpened(state, action) {
      state.openSearch = action.payload
    },
    openDropdownChanged(state, action) {
      state.openDropdown = action.payload
    },
    previewedImageChanged(state, action) {
      state.previewedImage = action.payload
    },
    saveChangesOpened(state, action) {
      state.saveChanges = action.payload
    },
    activeCategoryChanged(state, action) {
      state.activeCategory = action.payload
    },
    openCropperChanged(state, action) {
      state.openCropper = action.payload
    },
    setEditedMessage(state, action) {
      state.editedMessage = action.payload
    },
    componentClosed(state, action: { type: string; payload: componentName }) {
      delete state[action.payload]
    },
    resetPreviewedImage(state, action) {
      state.previewedImage = { url: "", uploaded: false }
    },
  },
})

export const {
  loggedOut,
  openModalChanged,
  openDropdownChanged,
  searchOpened,
  previewedImageChanged,
  activeCategoryChanged,
  saveChangesOpened,
  componentClosed,
  openCropperChanged,
  resetPreviewedImage,
  setEditedMessage,
} = UIReducer.actions

export const isActive = (
  modalName: string | boolean,
  componentType: componentName,
  entityName?: string,
) => {
  return createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => {
      if (componentType === "openModal") {
        if (entityName)
          return (
            UI[componentType]?.type === modalName &&
            UI[componentType]?.entity === entityName
          )
        else return UI[componentType]?.type === modalName
      }
      return UI[componentType] ? UI[componentType] === modalName : false
    },
  )
}

/** export const getComponent = (componentType: componentName) =>
  createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => UI[componentType],
  ) **/

export const getOpenCropper = () =>
  createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => UI.openCropper,
  )

export const getOpenSearch = () =>
  createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => UI.openSearch,
  )

export const getEditedMessage = () =>
  createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => UI.editedMessage,
  )

export const getOpenModal = () =>
  createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => UI.openModal,
  )

export const getSaveChanges = () =>
  createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => UI.saveChanges,
  )

export const getPreviewedImage = () =>
  createSelector(
    (state: RootState) => state.UI,
    (UI: UIState) => UI.previewedImage,
  )

export default UIReducer.reducer
