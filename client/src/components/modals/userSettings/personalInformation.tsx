import { yupResolver } from "@hookform/resolvers/yup"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { ObjectSchema } from "yup"
import * as yup from "yup"
import { RootState } from "../../redux/store"
import { editUser } from "../../../lib/DB"
import { enqueueSnackbar } from "notistack"

interface Inputs {
  email: string
  oldPassword: string
  password: string
  confirmPassword: string
}

const validationSchema: ObjectSchema<{
  email: string
  oldPassword: string
  password: string
  confirmPassword: string
}> = yup.object().shape({
  email: yup.string().email("Email is invalid").required("Email is required"),
  oldPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters")
    .required("Old password is required"),
  password: yup.string().max(32, "Password must be at most 32 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords don't match"),
})

const PersonalInformation = () => {
  const user = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: yupResolver(validationSchema),
    defaultValues: { email: user.email },
  })

  const EditUser: SubmitHandler<Inputs> = async (data: Inputs) => {
    editUser({
      oldPassword: data.oldPassword,
      dispatch: dispatch,
      password: data.password,
      email: data.email,
    }).then(() =>
      enqueueSnackbar("Successfully changed your personal information", {
        variant: "success",
      }),
    )
  }

  return (
    <div className="max-w-[740px] min-h-[460px] flex flex-col items-center max-h-screen overflow-y-auto grow shrink h-full px-[60px] pt-20">
      <h1 className="text-cspink-50 text-start font-bold text-2xl mb-6">
        Personal information
      </h1>
      <form
        onSubmit={handleSubmit(EditUser)}
        className="rounded-md w-96 flex bg-csblue-300 flex-col gap-4 shadow-lg p-2"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-cspink-200 font-semibold">
            EMAIL
          </label>
          <input
            type="email"
            className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
              errors.email
                ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
            }`}
            placeholder="Visitor"
            {...register("email")}
          />
          {errors.email ? (
            <span className="font-semibold text-red-400">
              {errors.email.message}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="oldPassword"
            className="text-cspink-200 font-semibold"
          >
            OLD PASSWORD
          </label>
          <input
            type="password"
            className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
              errors.oldPassword
                ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
            }`}
            {...register("oldPassword")}
          />
          {errors.oldPassword ? (
            <span className="font-semibold text-red-400">
              {errors.oldPassword.message}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-cspink-200 font-semibold">
            PASSWORD
          </label>
          <input
            type="password"
            className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
              errors.password
                ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
            }`}
            {...register("password")}
          />
          {errors.password ? (
            <span className="font-semibold text-red-400">
              {errors.password.message}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 mb-2">
          <label
            htmlFor="confirmPassword"
            className="text-cspink-200 font-semibold"
          >
            CONFIRM PASSWORD
          </label>
          <input
            type="password"
            className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
              errors.confirmPassword
                ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
            }`}
            {...register("password")}
          />
          {errors.confirmPassword ? (
            <span className="font-semibold text-red-400">
              {errors.confirmPassword.message}
            </span>
          ) : null}
        </div>
        <button className="font-bold w-full bg-cspink-200 p-2 rounded-md text-cspink-50">
          Submit
        </button>
      </form>
    </div>
  )
}

export default PersonalInformation
