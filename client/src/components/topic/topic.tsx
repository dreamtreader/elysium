import { useDispatch, useSelector } from "react-redux"
import PageWrapper from "../../lib/pageWrapper"
import { useParams } from "react-router-dom"
import { filterPosts, getTopicById } from "../redux/reducers/chatReducer"
import SearchBar from "./searchBar"
import PostCreator from "../modals/post/postCreator"
import PostHeader from "./post/postHeader"
import PostFiltering from "../modals/post/postFiltering"
import { useEffect, useState } from "react"
import { getPosts } from "../../lib/DB"
type params = {
  topicId: string
}
const Topic = ({}) => {
  const dispatch = useDispatch()
  const { topicId } = useParams<params>()

  const [input, setInput] = useState<string>("")
  const [fetching, setFetching] = useState<boolean>(false)

  if (topicId) {
    const topic = useSelector(getTopicById(topicId))
    const filteredPosts = useSelector(filterPosts(input, topicId))

    useEffect(() => {
      setFetching(true)
      getPosts({
        topicId: topic._id,
        serverId: topic.serverId,
        dispatch: dispatch,
      }).then(() => setFetching(false))
    }, [topicId])

    return (
      <PageWrapper title={topic.name}>
        <main className="w-full h-full p-4">
          <SearchBar
            onSubmit={async () => {
              setFetching(true)
              getPosts({
                input: input,
                topicId: topic._id,
                serverId: topic.serverId,
                dispatch: dispatch,
              }).then(() => setFetching(false))
            }}
            onChange={setInput}
            topic={topic}
          />

          {filteredPosts.length ? (
            filteredPosts.map((post) => (
              <ul
                onScroll={(e) => {
                  const target = e.target as HTMLUListElement
                  if (
                    target.scrollTop ==
                      target.scrollHeight - target.offsetHeight &&
                    filteredPosts.length
                  ) {
                    setFetching(true)
                    getPosts({
                      input: input,
                      topicId: topic._id,
                      serverId: topic.serverId,
                      dispatch: dispatch,
                      lastPost: filteredPosts[filteredPosts.length - 1],
                    }).then(() => setFetching(false))
                  }
                }}
                className="overflow-y-auto mt-4 p-4 rounded-lg bg-csblue-300"
              >
                <PostHeader post={post} />
                <div className="w-full h-[1px] bg-csblue-150 my-4" />
              </ul>
            ))
          ) : !fetching ? (
            <div className="mt-4 w-full font-bold text-cspink-300">
              No posts found here
            </div>
          ) : null}

          {fetching ? (
            <div className=" w-full flex justify-center items-center">
              <i className="text-4xl font-bold text-csblue-50 animate-spin bi bi-arrow-clockwise"></i>
            </div>
          ) : null}

          <PostCreator topic={topic} />
        </main>
        <PostFiltering />
      </PageWrapper>
    )
  } else return <div>Topic unavailable.</div>
}

export default Topic
