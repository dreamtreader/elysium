import axios from "axios"

import PageWrapper from "../lib/pageWrapper"
import { Link, Navigate } from "react-router-dom"
import { signIn } from "../components/redux/reducers/userReducer"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../components/redux/store"

import { useForm, SubmitHandler } from "react-hook-form"

import * as yup from "yup"
import { ObjectSchema } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

const url = "http://localhost:5000/user/login"

interface Inputs {
  username: string
  password: string
  rememberMe: boolean
}

const validationSchema: ObjectSchema<{
  username: string
  password: string
  rememberMe: boolean
}> = yup.object().shape({
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters")
    .max(20, "Username must be at most 20 characters")
    .required("Username is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .required("Password is required"),
  rememberMe: yup.boolean(),
})

const Login = () => {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>({ resolver: yupResolver(validationSchema) })

  const Login: SubmitHandler<Inputs> = async (data: Inputs) => {
    try {
      const response = await axios.post(url, data, { withCredentials: true })
      if (response.data) {
        if (data.rememberMe) {
          localStorage.setItem("username", data.username)
          localStorage.setItem("password", data.password)
        }
        dispatch(signIn(response.data))
      }
    } catch (err: any) {
      console.log(err)

      setError("username", {
        type: "string",
        message: "Username or password is invalid",
      })
      setError("password", {
        type: "string",
        message: "Username or password is invalid",
      })
    }
  }
  return (
    <PageWrapper title="Login">
      <>
        {user.isSignedIn ? (
          <Navigate to="/app" />
        ) : (
          <main
            style={{
              backgroundImage: `url(https://cdn.dribbble.com/users/1003944/screenshots/15741863/media/96a2668dbf0b4da82efca00d60011ca8.gif)`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
            className="w-[100vw] h-[100vh] flex justify-center items-center gap-4"
          >
            <form
              onSubmit={handleSubmit(Login)}
              className="w-1/3 p-4 flex flex-col gap-4 bg-csblue-200 rounded-md"
            >
              <h1 className="text-cspink-50 font-bold text-2xl text-center">
                Login
              </h1>
              <div className="flex flex-col">
                <label
                  htmlFor="username"
                  className="text-cspink-200 font-semibold"
                >
                  Username
                </label>
                <input
                  type="text"
                  className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                    errors.username
                      ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                      : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                  }`}
                  placeholder="Visitor"
                  {...register("username")}
                />
                {errors.username ? (
                  <span className="font-semibold text-red-400">
                    {errors.username.message}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="password"
                  className="text-cspink-200 font-semibold"
                >
                  Password
                </label>
                <input
                  type="password"
                  className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                    errors.password
                      ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                      : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                  }`}
                  placeholder="Visitor"
                  {...register("password")}
                />
                {errors.password ? (
                  <span className="font-semibold text-red-400">
                    {errors.password.message}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center checkbox">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  id="checkboxLogin"
                />
                <label className=" text-cspink-50" htmlFor="checkboxLogin">
                  Remember me
                </label>
              </div>
              <input
                type="submit"
                className="bg-cspink-200 hover:bg-cspink-100 ease-in duration-200 rounded-md p-2 font-bold text-cspink-50"
              />

              <span className="w-full inline-block text-center text-cspink-50">
                Don't have an account yet?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-cspink-100 hover:text-cspink-200"
                >
                  Sign up
                </Link>
              </span>
            </form>
          </main>
        )}
      </>
    </PageWrapper>
  )
}

export default Login
