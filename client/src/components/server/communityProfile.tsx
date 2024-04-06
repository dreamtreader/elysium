import { Server } from "../../types/entityTypes"

export const CommunityProfile = ({ server }: { server: Server }) => {
  return (
    <section className="w-full h-full flex flex-col">
      <div className="relative w-full h-[20%] bg-csblue-400">
        <span className="absolute left-1/2 top-full translate-y-[-50%] translate-x-[-50%] inline-flex w-32 border-[0.5rem] border-csblue-200 aspect-square rounded-full bg-csblue-500">
          <button className="bg-cspink-100 left-full top-full translate-x-[-100%] translate-y-[-100%] text-cspink-50 absolute inline-flex justify-center items-center w-8 aspect-square rounded-md">
            <i className="bi bi-pen"></i>
          </button>
        </span>
      </div>
      <div className="pt-20 px-5">
        <h1 className="z-10 text-center font-extrabold text-cspink-50 text-xl">
          {server.name}
        </h1>
        <div className="relative w-full p-2">
          <button className="w-10 rounded-full text-cspink-50 aspect-square absolute bg-cspink-200 inline-flex justify-center items-center left-full translate-x-[-100%]">
            <i className="bi bi-pen"></i>
          </button>
        </div>
      </div>
    </section>
  )
}
