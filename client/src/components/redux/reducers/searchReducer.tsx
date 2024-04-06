import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../store"
import { Channel, Member, partialUser, searchState } from "../../../types"
import { SearchParameter } from "../../../types"

type payload = {
  parameter: SearchParameter
  data: Channel | { user: partialUser; member: Member } | Date | boolean
}

const initialState: searchState = {
  parameters: {},
  input: {
    value: "",
  },
}

export const searchReducer = createSlice({
  name: "search",
  initialState,
  reducers: {
    loggedOut(state, action) {
      return initialState
    },
    changeInput(state, action) {
      state.input.value = action.payload
      state.input.changed =
        state.input.changed !== undefined ? !state.input.changed : true
    },
    resetFetch(state, action) {
      delete state.input.changed
    },
    activeParameterChanged(
      state,
      action: PayloadAction<{ activeParameter: SearchParameter }>,
    ) {
      state.activeParameter = action.payload.activeParameter
    },
    activeParameterRemoved(state, action) {
      delete state.activeParameter
    },

    parameterChanged(
      state,
      action: PayloadAction<{ parameter: SearchParameter; data: any }>,
    ) {
      state.parameters[action.payload.parameter] = action.payload.data
    },

    fromRemoved(state, action) {
      delete state.parameters.from
    },
    inRemoved(state, action) {
      delete state.parameters.in
    },
    beforeRemoved(state, action) {
      delete state.parameters.before
    },
    afterRemoved(state, action) {
      delete state.parameters.after
    },
    pinnedRemoved(state, action) {
      delete state.parameters.pinned
    },

    resetState(state, action) {
      delete state.activeParameter
      state.parameters = {}
      delete state.input.changed
    },
  },
})

export const getActiveParameter = () =>
  createSelector(
    (state: RootState) => state.search,
    (search: searchState) => search.activeParameter,
  )

export const getParameters = () =>
  createSelector(
    (state: RootState) => state.search,
    (search: searchState) => search.parameters,
  )

export const getInput = () =>
  createSelector(
    (state: RootState) => state.search,
    (search: searchState) => search.input,
  )

export const {
  loggedOut,
  changeInput,
  parameterChanged,
  resetState,
  resetFetch,
  activeParameterChanged,
  activeParameterRemoved,
  inRemoved,
  fromRemoved,
  afterRemoved,
  beforeRemoved,
  pinnedRemoved,
} = searchReducer.actions

export default searchReducer.reducer
