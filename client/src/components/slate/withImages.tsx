import { BaseEditor, Transforms } from "slate"
import imageExtensions from "image-extensions"
import isUrl from "is-url"
import { ReactEditor } from "slate-react"
import { HistoryEditor } from "slate-history"

export const withImages = (editor) => {
  const { insertData, isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element)
  }

  editor.insertData = (data) => {
    const text = data.getData("text/plain")
    const { files } = data

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader()
        const [mime] = file.type.split("/")

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result
            insertImage(editor, url)
          })

          reader.readAsDataURL(file)
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export const insertImage = (
  editor: BaseEditor & ReactEditor & HistoryEditor,
  url,
) => {
  Transforms.insertNodes(
    editor,
    [
      {
        type: "image",
        children: [{ text: "" }],
        url: url,
        height: 0,
      },
      { type: "paragraph", children: [{ text: "" }] },
    ],
    { select: true },
  )
}

const isImageUrl = (url) => {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split(".").pop()
  return imageExtensions.includes(ext)
}
