import { Route, Routes, BrowserRouter } from "react-router-dom"

import SignUp from "./SignUp"
import Server from "./Server"
import Channel from "./Channel"
import Login from "./Login"
import App from "./App"
import DMs from "./DMs"
import Servers from "./Servers"
import PrivateRoute from "../lib/PrivateRoute"
import { Settings } from "./Settings"
import { socket } from "../socket/socketInitializer"
import SocketListener from "../socket/socketListener"
import Topic from "../components/topic/topic"
import DM from "./DM"
import Friends from "./Friends"
import Post from "./Post"

function Main() {
  return (
    <BrowserRouter>
      <SocketListener />
      <Routes>
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        >
          <Route
            path="friends"
            element={
              <PrivateRoute>
                <Friends />
              </PrivateRoute>
            }
          />
          <Route
            path="dms"
            element={
              <PrivateRoute>
                <DMs />
              </PrivateRoute>
            }
          >
            <Route
              path=":channelId"
              element={
                <PrivateRoute>
                  <DM />
                </PrivateRoute>
              }
            />
          </Route>
          <Route
            path="servers"
            element={
              <PrivateRoute>
                <Servers />
              </PrivateRoute>
            }
          >
            <Route
              path=":serverId"
              element={
                <PrivateRoute>
                  <Server />
                </PrivateRoute>
              }
            >
              <Route
                path=":topicId"
                element={
                  <PrivateRoute>
                    <Topic />
                  </PrivateRoute>
                }
              ></Route>
              <Route
                path=":topicId/channels/:channelId"
                element={
                  <PrivateRoute>
                    <Channel />
                  </PrivateRoute>
                }
              />
              <Route
                path=":topicId/posts/:postId"
                element={
                  <PrivateRoute>
                    <Post />
                  </PrivateRoute>
                }
              />
            </Route>
          </Route>
          <Route
            path="settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
        </Route>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Main

/***
      <Routes>
        <Route path="/">
          <Route path="app">
            <Route path="channels">
              <Route path=":serverId:channelId?/"/>
            </Route>
            <Route path="friends" />
            <Route path="settings" />
          </Route>
          <Route path="login" />
          <Route path="register" />
        </Route>
      </Routes>
 ***/
