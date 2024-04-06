import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import {
  getPostById,
  getUserById,
} from "../components/redux/reducers/chatReducer"
import ErrorPage from "./ErrorPage"
import Image from "../components/image"
import { useEffect } from "react"
import { deletePost, getPost } from "../lib/DB"
import { RootState, store } from "../components/redux/store"
import UserIcon from "../components/userIcon"
import { getMemberByUserId } from "../components/redux/reducers/memberReducer"
import Menu from "../components/menu"
import { defaultBanner } from "../types/defaultImages"
import PermService from "../lib/perms"

type params = {
  postId: string
  serverId: string
  topicId: string
}

const Post = () => {
  const dispatch = useDispatch()
  const { postId, serverId, topicId } = useParams<params>()
  const post = useSelector(getPostById(postId))

  useEffect(() => {
    if (post) {
      if (!post.fullyFetched)
        getPost({
          postId: postId,
          serverId: serverId,
          topicId: topicId,
          dispatch: dispatch,
        })
    } else {
      const state = store.getState()
      if (!state.chat.posts[postId]) {
        getPost({
          postId: postId,
          serverId: serverId,
          topicId: topicId,
          dispatch: dispatch,
        })
      }
    }
  }, [postId])

  const member = useSelector(getMemberByUserId(post?.authorId, post?.serverId))
  const perms = new PermService(store.getState())
  const user = useSelector((state: RootState) => state.user)
  const navigate = useNavigate()

  if (!post) return <ErrorPage />

  return (
    <main className="p-4 w-full h-full overflow-y-auto">
      <div className="rounded-2xl bg-csblue-300 w-full">
        <div
          style={{
            backgroundImage: post.banner
              ? `url(${post.banner})`
              : `url(${defaultBanner})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className={`
              overflow-x-hidden overflow-y-hidden rounded-tl-2xl rounded-tr-2xl aspect-video relative
          `}
        >
          <div className="backdrop-blur-sm border-b-[1px] border-csblue-100 absolute flex justify-between items-center w-full py-4 px-6 ">
            <div className="flex items-center">
              <UserIcon className="w-10 h-10" user={member} />
              <div className="flex justify-center items-center ">
                <h2 className="ml-2 text-csblue-100 font-bold">
                  {member.displayName}
                </h2>
                <h2 className="italic ml-2 text-csblue-100 font-bold">
                  @{member.username}
                </h2>
              </div>
            </div>
            <Menu
              placement={"left"}
              button={
                <button className="text-csblue-100 hover:text-csblue-50">
                  <i className="bi bi-three-dots"></i>
                </button>
              }
              menuItems={[
                [
                  {
                    content: "Edit post",
                    condition: user._id === post.authorId,
                  },
                ],
                [
                  {
                    condition:
                      user._id === post.authorId ||
                      perms.isAbleTo("ADMINISTRATOR", post.serverId),
                    content: "Delete post",
                    danger: true,
                    onClick: async () => {
                      await deletePost({
                        postId: post._id,
                        serverId: post.serverId,
                        topicId: post.topicId,
                        dispatch: dispatch,
                      })
                      navigate(-1)
                    },
                  },
                ],
              ]}
            />
          </div>

          {/**<div className="absolute left-[50%] translate-x-[-50%] top-[80%] w-screen h-40 bg-csblue-300 blur-lg" />
          <div className="absolute bottom-[0%] mb-4 p-4 px-8 flex justify-between w-full items-center">
            <div className="p-4 backdrop-blur-sm bg-csblue-700  bg-opacity-60 rounded-md">
              <h1 className="font-bold text-cspink-50 text-4xl">
                {post.title}
              </h1>
            </div>
            <button className="bg-cspink-200 p-1 px-8 rounded-full font-bold text-cspink-50">
              Like
            </button>
            </div> **/}
        </div>

        <div className="p-4 px-8 flex border-b-[1px] border-csblue-100 justify-between w-full items-center">
          <h1 className="font-bold text-cspink-50 text-4xl">{post.title}</h1>
          <button className="bg-cspink-200 p-1 px-8 rounded-full font-bold text-cspink-50">
            Like
          </button>
        </div>

        {!post.fullyFetched ? (
          <div className="w-full flex justify-center">
            <i className="text-4xl font-bold text-csblue-50 animate-spin bi bi-arrow-clockwise"></i>
          </div>
        ) : (
          <div
            className="p-2 px-8"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />
        )}
        {post.tags.length ? (
          <ul className="border-t-[1px] border-csblue-100 p-2 px-8 flex gap-3">
            {post.tags.map((tag) => (
              <li className="rounded-full font-bold text-cspink-50 bg-cspink-200 px-4 py-1">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  )
}

export default Post
