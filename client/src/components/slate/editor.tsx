import {
  Editor,
  BaseEditor,
  Transforms,
  Descendant,
  Element as SlateElement,
} from "slate"
import { HistoryEditor } from "slate-history"
import {
  Slate,
  Editable,
  ReactEditor,
  useSlate,
  useSelected,
  useFocused,
} from "slate-react"
import { useCallback } from "react"
import { Element, Leaf, Button } from "./elements"

import Icon from "@mui/material/Icon"
import { insertImage } from "./withImages"
import ColorSelector from "../menus/colorSelector"

const LIST_TYPES = ["numbered-list", "bulleted-list"]
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"]

const RichEditor = ({
  initialValue,
  editor,
}: {
  initialValue: Descendant[]
  editor: BaseEditor & ReactEditor & HistoryEditor
}) => {
  const selected = useSelected()
  const focused = useFocused()

  const renderElement = useCallback((props) => <Element {...props} />, [])
  const renderLeaf = useCallback((props) => <Leaf {...props} />, [])

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <div className="border-[1px] border-csblue-400 rounded-tl rounded-tr">
        <section className="rounded-tl rounded-tr bg-csblue-300 w-full flex items-center gap-3 p-2">
          <MarkButton format="bold" icon="format_bold" />
          <MarkButton format="italic" icon="format_italic" />
          <MarkButton format="underline" icon="format_underlined" />
          <MarkButton format="code" icon="code" />
          <ColorButton />
          <Divider />
          <BlockButton format="heading-one" icon="looks_one" />
          <BlockButton format="heading-two" icon="looks_two" />
          <BlockButton format="block-quote" icon="format_quote" />
          <BlockButton format="numbered-list" icon="format_list_numbered" />
          <BlockButton format="bulleted-list" icon="format_list_bulleted" />
          <BlockButton format="left" icon="format_align_left" />
          <BlockButton format="center" icon="format_align_center" />
          <BlockButton format="right" icon="format_align_right" />
          <Divider />
          <ImageButton />
          <DividerButton />
        </section>
        <Editable
          onKeyDown={(e) => {
            if (selected && focused && e.key === "&") {
              editor.insertSoftBreak()
            }
          }}
          className="p-2 text-sm overflow-x-hidden"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck
          autoFocus
        />
      </div>
    </Slate>
  )
}

const Divider = () => {
  return <div className="w-[1px] h-4 bg-csblue-50" />
}
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    }),
  )

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type",
      )}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const ImageButton = () => {
  const editor = useSlate()
  return (
    <Button className="relative cursor-pointer">
      <Icon>image</Icon>
      <input
        onChange={(e) => {
          if (e.target.files.length && e.target.files[0]) {
            const fileReader = new FileReader()

            fileReader.onloadend = () => {
              insertImage(editor, fileReader.result)
            }
            fileReader.readAsDataURL(e.target.files[0])
          }
        }}
        className="w-4 h-4 z-[200] absolute opacity-0"
        type="file"
        accept="image/*"
      />
    </Button>
  )
}

const DividerButton = () => {
  const editor = useSlate()
  return (
    <Button
      onMouseDown={(e) => {
        insertImage(
          editor,
          "https://res.cloudinary.com/dnpgwek4e/image/upload/v1704537031/avatars/line_3_w3eerl.png",
        )
      }}
      className="cursor-pointer"
    >
      ...
    </Button>
  )
}

const ColorButton = () => {
  const editor = useSlate()
  const marks = Editor.marks(editor)
  return (
    <ColorSelector
      onSelect={(color) => {
        Editor.addMark(editor, "color", color.slice(3))
      }}
    >
      <Icon className={`text-${marks?.color}`}>format_color_text</Icon>
    </ColorSelector>
  )
}

export default RichEditor
