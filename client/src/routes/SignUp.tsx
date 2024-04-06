import axios from "axios"
import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { signIn } from "../components/redux/reducers/userReducer"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../components/redux/store"

import PageWrapper from "../lib/pageWrapper"
import { useForm, SubmitHandler } from "react-hook-form"

import * as yup from "yup"
import { ObjectSchema } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

import Crop from "../components/crop"
import {
  componentClosed,
  openCropperChanged,
} from "../components/redux/reducers/UIReducer"

const url = "http://localhost:5000/user/create"

interface Inputs {
  displayName: string
  username: string
  email: string
  password: string
}

const validationSchema: ObjectSchema<{
  displayName: string
  username: string
  email: string
  password: string
}> = yup.object().shape({
  displayName: yup.string().required("The display name is a required field"),
  username: yup
    .string()
    .min(5, "Username must be at least 5 characters")
    .max(20, "Username must be at most 20 characters")
    .required("Username is required"),
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .required("Password is required"),
})

const Register = () => {
  const [avatar, setAvatar] = useState("./default.png")

  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: yupResolver(validationSchema) })

  const CreateUser: SubmitHandler<Inputs> = async (data: Inputs) => {
    try {
      const response = await axios.post(url, data)
      dispatch(signIn(response.data))
      return { ...response.data, userId: response.data._id }
    } catch (err) {
      let message
      if (err instanceof Error) message = err.message
      else message = String(err)
    }
  }

  return (
    <PageWrapper title="Sign up">
      <>
        {user.isSignedIn ? (
          <Navigate to="/app" />
        ) : (
          <main className="w-[100vw] h-[100vh] flex justify-center items-center gap-4 bg-csblue-200">
            <Crop />
            <form
              onSubmit={handleSubmit(CreateUser)}
              className="w-1/3 p-4 flex flex-col gap-4"
            >
              <h1 className="text-cspink-50 font-bold text-2xl text-center">
                Sign up
              </h1>
              <div
                style={{
                  backgroundImage: `url(${avatar})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
                className={`icon w-20 ${
                  avatar == "./default.png" ? `ring-2 ring-csblue-600` : null
                } cursor-pointer aspect-square self-center relative`}
              >
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      dispatch(
                        openCropperChanged({
                          src: URL.createObjectURL(e.target.files[0]),
                          onCrop: (value) => setAvatar(value),
                        }),
                      )
                    }
                  }}
                  className="relative opacity-0 w-full h-full bottom-[-50%] translate-y-[-50%]"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="displayName"
                  className="text-cspink-200 font-semibold"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                    errors.displayName
                      ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                      : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                  }`}
                  placeholder="Visitor"
                  {...register("displayName")}
                />
                {errors.displayName ? (
                  <span className="font-semibold text-red-400">
                    {errors.displayName.message}
                  </span>
                ) : null}
              </div>
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
                  placeholder="ElysiumVisitor"
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
                  htmlFor="email"
                  className="text-cspink-200 font-semibold"
                >
                  Email
                </label>
                <input
                  className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                    errors.email
                      ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                      : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                  }`}
                  type="email"
                  placeholder="example@elysium.com"
                  {...register("email")}
                />
                {errors.email ? (
                  <span className="font-semibold text-red-400">
                    {errors.email.message}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-cspink-200 font-semibold"
                >
                  Password
                </label>
                <input
                  className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                    errors.password
                      ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                      : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                  }`}
                  type="password"
                  placeholder="StrongElysiumPass@1234"
                  {...register("password")}
                />
                {errors.password ? (
                  <span className="font-semibold text-red-400">
                    {errors.password.message}
                  </span>
                ) : null}
              </div>
              <input
                type="submit"
                className="bg-cspink-200 hover:bg-cspink-100 ease-in duration-200 rounded-md p-2 font-bold text-cspink-50"
              />
              <span className="w-full inline-block text-center text-cspink-50">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cspink-100 hover:text-cspink-200"
                >
                  Login
                </Link>
              </span>
            </form>
            <section
              style={{
                backgroundImage: `url(https://cdn.dribbble.com/users/1003944/screenshots/15741863/media/96a2668dbf0b4da82efca00d60011ca8.gif)`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
              className="w-2/3 h-full rounded-lg rounded-tl-none rounded-bl-none"
            ></section>
          </main>
        )}
      </>
    </PageWrapper>
  )
}

export default Register
