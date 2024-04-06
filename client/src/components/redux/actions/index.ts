import { chatReducer } from "../reducers/chatReducer"
import { memberReducer } from "../reducers/memberReducer"
import { roleReducer } from "../reducers/roleReducer"
import { searchReducer } from "../reducers/searchReducer"
import { typingReducer } from "../reducers/typingReducer"
import { UIReducer } from "../reducers/UIReducer"
import { userReducer } from "../reducers/userReducer"

const actions = {
  ...chatReducer.actions,
  ...memberReducer.actions,
  ...roleReducer.actions,
  ...userReducer.actions,
}

export type ReduxAction = keyof typeof actions

export default actions
