import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./reducers/userReducer"
import chatReducer from "./reducers/chatReducer"
import roleReducer from "./reducers/roleReducer"
import UIReducer from "./reducers/UIReducer"
import typingReducer from "./reducers/typingReducer"
import memberReducer from "./reducers/memberReducer"
import searchReducer from "./reducers/searchReducer"
import pingReducer from "./reducers/pingReducer"
import { socketMiddleware } from "./middleware/socketMiddleware"
export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    roles: roleReducer,
    members: memberReducer,
    UI: UIReducer,
    typing: typingReducer,
    search: searchReducer,
    pings: pingReducer,
  },
  middleware: [socketMiddleware()],
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
