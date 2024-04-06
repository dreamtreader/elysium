import { useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../components/redux/store"
import { User } from "../types"

import { useForm, SubmitHandler } from "react-hook-form"
import PageWrapper from "../lib/pageWrapper"

import * as yup from "yup"
import { ObjectSchema } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

const settings = [{ name: "Account", children: ["General Information"] }]

interface Inputs {
  email: string
  username: string
  password: string
  confirmPassword: string
}

const validationSchema: ObjectSchema<{
  username: string
  password: string
  email: string
  confirmPassword: string
}> = yup.object().shape({
  email: yup
    .string()
    .email("Email must be valid")
    .required("Email is required"),
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
  confirmPassword: yup
    .string()
    .test("passwords-match", "Passwords must match", function (value) {
      return this.parent.password === value
    })
    .required("Password confirmation is required"),
})

const GeneralInfo = ({ user }: { user: User }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>({ resolver: yupResolver(validationSchema) })

  const FormSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    try {
    } catch (err: any) {
      console.log(err.message)
    }
  }

  return (
    <div className="w-full h-full flex justify-center">
      <section className="w-[80%] h-full p-4 flex flex-col gap-5">
        <h1 className="text-center text-cspink-50 font-extrabold text-2xl">
          General Information
        </h1>
        <h2 className=" text-csblue-50 font-bold text-md">
          Leaving any of the form inputs blank will result into submitting the
          information previously entered for your account.
        </h2>
        <form
          onSubmit={handleSubmit(FormSubmit)}
          className="rounded-md w-full bg-csblue-300 p-4 flex flex-col gap-2"
        >
          <div className="items-start grid grid-cols-2 gap-x-5 gap-y-10 text-csblue-100">
            <div className="col-start-1 flex flex-col gap-2">
              <label className=" col-end-1 text-cspink-100 font-bold text-lg">
                EMAIL
              </label>
              <input
                className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                  errors.email
                    ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                    : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                }`}
                type="email"
                defaultValue={user.email}
                placeholder="Type in email.."
                {...register("email")}
              />
              <input
                className=" bg-csblue-400 rounded-md p-2"
                type="email"
                placeholder="Repeat new email.."
              />
              {errors.email ? (
                <span className="font-semibold text-red-400">
                  {errors.email.message}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <label className=" text-cspink-100 font-bold text-lg">
                PASSWORD
              </label>
              <input
                className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                  errors.password
                    ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                    : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                }`}
                type="password"
                placeholder="Type in a new password.."
                {...register("password")}
              />
              <input
                className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                  errors.password
                    ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                    : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                }`}
                type="password"
                placeholder="Repeat new password.."
                {...register("confirmPassword")}
              />
              {errors.password ? (
                <span className="font-semibold text-red-400">
                  {errors.password.message}
                </span>
              ) : null}
              {errors.confirmPassword ? (
                <span className="font-semibold text-red-400">
                  {errors.confirmPassword.message}
                </span>
              ) : null}
            </div>
            <div className=" flex flex-col gap-2">
              <label className=" text-cspink-100 font-bold text-lg">
                USERNAME
              </label>
              <input
                className={`bg-csblue-400 rounded-md p-2 placeholder-csblue-100 text-csblue-100 transition-all ease-in duration-300 ${
                  errors.username
                    ? `ring-1 ring-red-400 border-red-400 focus:ring-red-400 focus:border-red-400 transition-none`
                    : `focus:ring-1 focus:ring-cspink-200 focus:border-cspink-200`
                }`}
                type="text"
                defaultValue={user.username}
                placeholder="Type in username.."
                {...register("username")}
              />
              {errors.username ? (
                <span className="font-semibold text-red-400">
                  {errors.username.message}
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <label className=" text-cspink-100 font-bold text-lg">
                DATE OF BIRTH
              </label>
              <input className=" bg-csblue-400 rounded-md p-2" type="date" />
            </div>
          </div>

          <input
            type="submit"
            className="bg-cspink-200 hover:bg-cspink-100 ease-in duration-200 rounded-md p-2 font-bold text-cspink-50"
          />
        </form>
      </section>
    </div>
  )
}

export const Settings = () => {
  const [index, setIndex] = useState(-1)
  const [value, setValue] = useState("")
  const user = useSelector((state: RootState) => state.user)

  const components: JSX.Element[] = [<GeneralInfo user={user} />]
  return (
    <PageWrapper title="Settings">
      <main className="w-full h-full grid grid-cols-[20%_1fr]">
        <ul className="flex flex-col gap-2 border-r-[2px] border-csblue-300 p-4">
          {settings.map((category, categIndex) => (
            <div className="flex flex-col gap-2">
              <h1 className="p-1 font-extrabold text-cspink-50">
                {category.name.toUpperCase()}
              </h1>
              <ul className="flex flex-col">
                {category.children.map((child, index) => (
                  <button
                    onClick={(e) => setIndex(index)}
                    className="inline-flex w-full p-1 rounded-md text-lg text-csblue-50 hover:text-cspink-50 hover:bg-csblue-100 font-medium"
                  >
                    {child}
                  </button>
                ))}
              </ul>
            </div>
          ))}
        </ul>
        {components[index] ? components[index] : null}
        <div id="toolbar" className="ql-toolbar">
          <select
            className="ql-header"
            defaultValue={""}
            onChange={(e) => e.persist()}
          >
            <option value="1"></option>
            <option value="2"></option>
            <option selected></option>
          </select>
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <select className="ql-color">
            <option value="red"></option>
            <option value="green"></option>
            <option value="blue"></option>
            <option value="orange"></option>
            <option value="violet"></option>
            <option value="#d0d1d2"></option>
            <option selected></option>
          </select>
        </div>
      </main>
    </PageWrapper>
  )
}
