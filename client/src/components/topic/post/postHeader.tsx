import { useSelector } from "react-redux"
import { Post } from "../../../types"
import { getUserById } from "../../redux/reducers/chatReducer"
import UserIcon from "../../userIcon"
import { Link } from "react-router-dom"
import { defaultBanner } from "../../../types/defaultImages"

const PostHeader = ({ post }: { post: Post }) => {
  const author = useSelector(getUserById(post.authorId))
  return (
    <Link to={`posts/${post._id}`} className="rounded-md w-full h-40 flex">
      <section
        style={{
          backgroundImage: `url(${post.banner ?? defaultBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="rounded-lg bg-csblue-400 h-full aspect-video"
      />
      <section className="px-2 grid grid-rows-3 grid-cols-2 overflow-x-hidden">
        <h1 className="col-span-2 text-3xl whitespace-nowrap text-ellipsis overflow-y-hidden overflow-x-hidden font-bold text-cspink-50">
          {post.title}
        </h1>
        <p className="col-start-1 col-span-2 max-h-15 overflow-hidden text-ellipsis text-csblue-50">
          {post.description}
        </p>
        <span className="col-start-1 flex items-center gap-2">
          <UserIcon className="w-8 h-8" user={author} />
          <span className="text-csblue-50 font-bold">{author.displayName}</span>
          <span className="text-csblue-100 font-bold">@{author.username}</span>
        </span>
        {/**<span className="justify-self-end col-start-2 flex items-center gap-2">
          15 likes
        </span>**/}
      </section>
    </Link>
  )
}

export default PostHeader
