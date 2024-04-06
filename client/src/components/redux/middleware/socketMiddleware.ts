import { chatDataLoaded } from "../reducers/chatReducer"

import { socket } from "../../../socket/socketInitializer"
import { Dispatch } from "react"
import { AnyAction, MiddlewareAPI } from "redux"

export const socketMiddleware = () => {
  return (socketApi: MiddlewareAPI) => {
    return (next: Dispatch<AnyAction>) => (action: any) => {
      if (action.type == chatDataLoaded.type) {
        socket.connect()
      }

      next(action)
    }
  }
}
