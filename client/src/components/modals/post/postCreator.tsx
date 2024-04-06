import { useMemo, KeyboardEvent } from "react"
import Modal from "../../Modal"
import { useDispatch, useSelector } from "react-redux"
import {
  componentClosed,
  isActive,
  openCropperChanged,
} from "../../redux/reducers/UIReducer"
import { Topic } from "../../../types"

import {
  useForm,
  SubmitHandler,
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form"
import * as yup from "yup"
import { ObjectSchema } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

import Image from "../../image"
import { useSnackbar } from "notistack"
import Crop from "../../crop"
import RichEditor from "../../slate/editor"
import { HistoryEditor, withHistory } from "slate-history"
import { ReactEditor, withReact } from "slate-react"
import { BaseEditor, Editor, Transforms, createEditor } from "slate"
import { withImages } from "../../slate/withImages"
import { socket } from "../../../socket/socketInitializer"
import { ImageElement } from "../../../types/slateTypes"
import { createTopicPost } from "../../../lib/DB"

interface Inputs {
  title: string
  banner?: string
  tags: (string | undefined)[]
}

const validationSchema: ObjectSchema<Inputs> = yup.object().shape({
  title: yup
    .string()
    .min(2, "Title must possess at least 2 characters")
    .max(20, "Title must possess at most 100 characters")
    .required("Title is required"),
  banner: yup.string(),
  tags: yup
    .array()
    .of(yup.string())
    .min(0)
    .max(10, "You cannot include more than 10 tags in a post")
    .default([]),
})

const Field = ({
  fieldName,
  fieldCode,
  errors,
  register,
  input,
  required = false,
  className,
}: {
  fieldName: string
  fieldCode?: keyof Inputs
  input?: JSX.Element
  register?: UseFormRegister<Inputs>
  required?: boolean
  errors?: FieldErrors<Inputs>
  className?: string
}) => {
  return (
    <div className={`pt-4 w-full flex flex-col gap-2 ${className}`}>
      <div className="text-lg w-full font-bold text-cspink-200">
        {fieldName}
        {required ? <span className="text-rose-400"> *</span> : null}
      </div>
      {input ? (
        input
      ) : (
        <input
          required={required}
          type="text"
          className="p-2 text-md rounded-md border-[1px] bg-csblue-200 border-csblue-400 text-cspink-50"
          {...(fieldCode && register ? { ...register(fieldCode) } : null)}
        />
      )}

      {fieldCode ? (
        errors?.[fieldCode] ? (
          <span className="font-semibold text-red-400">
            {errors?.[fieldCode]?.message}
          </span>
        ) : null
      ) : null}
    </div>
  )
}

const Banner = ({
  banner,
  setValue,
}: {
  banner?: string
  setValue?: UseFormSetValue<Inputs>
}) => {
  const dispatch = useDispatch()
  return (
    <div className="w-full flex gap-2">
      {banner ? (
        <div className="relative">
          <Image
            key={banner}
            className="aspect-video max-h-32 rounded-md"
            URL={banner}
          />
          <button
            onClick={(e) => {
              e.preventDefault()
              setValue?.("banner", undefined)
            }}
            className="absolute left-[100%] w-8 aspect-square bg-cspink-200 translate-x-[-80%] translate-y-[-80%] rounded-md"
          >
            <i className="bi bi-trash-fill"></i>
          </button>
        </div>
      ) : (
        <div
          className={`w-36 flex justify-center items-center text-2xl text-csblue-100 hover:text-cspink-100 cursor-pointer  bg-csblue-300 rounded-md cursor-pointer aspect-square self-center relative`}
        >
          <i className="bi bi-upload"></i>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                dispatch(
                  openCropperChanged({
                    src: URL.createObjectURL(e.target.files[0]),
                    aspectRatio: 16 / 9,
                    onCrop: (value: string) => {
                      setValue ? setValue("banner", value) : null
                    },
                  }),
                )
              }
            }}
            className="absolute opacity-0 w-full h-full bottom-[-50%] translate-y-[-50%]"
          />
        </div>
      )}
    </div>
  )
}
export const PostCreator = ({ topic }: { topic: Topic }) => {
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>({ resolver: yupResolver(validationSchema) })
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs) => {
    await createTopicPost({
      ...data,
      content: editor,
      attachments: editor.children
        .filter((descendant) => (descendant as ImageElement).type == "image")
        .map((descendant) => (descendant as ImageElement).url),
      topicId: topic._id,
      serverId: topic.serverId,
    })
  }

  const { enqueueSnackbar } = useSnackbar()
  const open = useSelector(isActive("postCreator", "openModal"))

  const banner = watch("banner")
  const tags = watch("tags")

  const editor: BaseEditor & ReactEditor & HistoryEditor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    [],
  )

  return (
    <Modal open={open}>
      <div
        onClick={(e) => {
          Transforms.delete(editor, {
            at: {
              anchor: Editor.start(editor, []),
              focus: Editor.end(editor, []),
            },
          })
          reset()
          dispatch(componentClosed("openModal"))
        }}
        className="w-screen h-screen bg-csblue-500 p-4 flex flex-col items-center"
      >
        <Crop />
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-csblue-200 max-h-screen overflow-y-auto w-1/2 min-w-[20rem] text-cspink-50 text-xl divide-y-[1px] divide-csblue-400 font-bold rounded-md p-4 flex flex-col gap-4"
        >
          <h1 className="">Create a post in @{topic.name}</h1>
          <Field
            errors={errors}
            register={register}
            fieldName="TITLE"
            required={true}
            fieldCode="title"
          />
          <Field
            fieldCode="banner"
            errors={errors}
            register={register}
            fieldName="BANNER"
            input={<Banner banner={banner} setValue={setValue} />}
          />
          <Field
            errors={errors}
            register={register}
            fieldName="CONTENT"
            required={true}
            className="font-medium text-md"
            input={
              <>
                <RichEditor
                  editor={editor}
                  initialValue={[
                    { type: "paragraph", children: [{ text: "" }] },
                  ]}
                />
                <p className="text-sm text-csblue-50">
                  Note: All of your h1s and h2s will be included in your table
                  of contents, allowing any user to scroll towards different
                  sections of your post easily
                </p>
              </>
            }
          />
          <Field
            fieldName="TAGS"
            input={
              <div className="max-w-full text-sm flex items-center gap-2 text-cspink-50 font-normal border-csblue-400 border-[1px] rounded-md focus:border-none">
                <div className="pl-2 h-full flex items-center gap-2">
                  {tags?.length
                    ? tags?.map((tag) => (
                        <span className="gap-2 px-2 text-sm rounded-full inline-flex min-w-10 justify-center items-center bg-cspink-200 text-cspink-50 font-bold">
                          {tag}
                          <i
                            onClick={(e) => {
                              var tags = getValues("tags")
                              tags = tags.reduce(
                                (
                                  accumulator: (string | undefined)[],
                                  currentValue: string | undefined,
                                ) =>
                                  currentValue === tag
                                    ? accumulator
                                    : [...accumulator, currentValue],
                                [],
                              )

                              setValue("tags", tags)
                            }}
                            className="cursor-pointer text-lg bi bi-x flex items-center stroke-2"
                          ></i>
                        </span>
                      ))
                    : null}
                </div>
                <div
                  onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.code == "Enter" || e.code == "Space") {
                      e.preventDefault()
                      const input = (
                        e.target as HTMLDivElement
                      ).innerText.replace(/\s+/g, "")
                      const tags = getValues("tags")
                      const alreadyInTags = tags ? tags.includes(input) : false
                      if (tags?.length >= 5)
                        return enqueueSnackbar(
                          "You've reached the max amount of tags for this post",
                          { variant: "error" },
                        )
                      if (alreadyInTags) {
                        ;(e.target as HTMLDivElement).innerText = ""
                        return enqueueSnackbar(
                          "You've already entered this tag",
                          { variant: "error" },
                        )
                      }
                      if (input.length) {
                        setValue("tags", [...(tags ? tags : []), input])
                        ;(e.target as HTMLDivElement).innerText = ""
                      }
                    }
                  }}
                  className="p-2 w-full h-full"
                  contentEditable
                />
              </div>
            }
          />
          <input
            type="submit"
            className="w-full bg-cspink-200 hover:bg-cspink-100 rounded-md p-2"
          />
        </form>
      </div>
    </Modal>
  )
}

export default PostCreator
