import { useState, useRef, useEffect } from "react"

interface label {
  name: string
  type: string
  value?: string
  placeholder?: string
  required?: boolean
}

const Form = ({
  content,
  title,
  onSubmit,
  buttonContent,
  classes,
  params,
}: {
  content: { [index: string]: any }
  title?: string
  onSubmit?: (e: any, params?: any) => any
  buttonContent?: string
  classes?: string
  params?: any
}) => {
  const form = useRef<HTMLFormElement>(document.createElement("form"))

  const [formState, setFormState] = useState({
    ...content,
  })

  const Submit = (e: any) => {
    e.preventDefault()
    if (form.current.checkValidity() && onSubmit) {
      const info = {
        ...Object.keys(formState).map((key) => ({
          key: formState[key],
        })),
      }
      onSubmit(e, info)
    }
  }

  return (
    <form
      ref={form}
      onSubmit={(e) => Submit(e)}
      className={`text-cspink-50 flex flex-col justify-center items-center p-4 rounded-lg gap-4 ${
        classes ? classes : ``
      }`}
    >
      <h1 className="text-cspink-50 font-bold text-2xl">
        {title ? title : "Please add a title"}
      </h1>
      {Object.values(formState).map((label) => (
        <div key={label.name} className="w-full flex flex-col">
          <h2 className="font-bold text-cspink-100">{label.name}</h2>
          <input
            type={label.type}
            onChange={(e: any) => {
              const key = label.name.replaceAll(" ", "")

              const newFormState = formState
              newFormState[key] = { ...label, value: e.target.value }
              setFormState({ ...newFormState })
            }}
            required={label.required}
            className="bg-csblue-400 p-2 rounded-lg placeholder:text-csblue-100 text-cspink-100 ease-in duration-300 focus:border-sky-200 required:border-red-500"
            placeholder={label.placeholder || ""}
          />
        </div>
      ))}
      <button className="bg-cspink-200 font-bold hover:bg-cspink-100 w-full p-2 rounded-xl">
        {buttonContent ? buttonContent : "Submit"}
      </button>
    </form>
  )
}

export default Form
