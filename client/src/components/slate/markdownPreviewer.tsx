import Prism from "prismjs"
import "prismjs/components/prism-markdown"
import { useCallback, useState } from "react"
import { Slate, Editable, ReactEditor, RenderLeafProps } from "slate-react"
import { HistoryEditor } from "slate-history"
import {
  Editor,
  Text,
  Transforms,
  BaseEditor,
  Descendant,
  NodeEntry,
  Range,
} from "slate"
import { Element, Leaf } from "./elements"
import { ImageElement, MentionElement } from "../../types/slateTypes"

import { Member, Role, partialUser } from "../../types"

import { ParagraphElement, FormattedText } from "../../types/slateTypes"

import MentionMenu from "./mentionMenu"

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Text: FormattedText
    Element: ParagraphElement | MentionElement | ImageElement
  }
}

const MarkdownPreviewer = ({
  editor,
  initialValue,
  placeholder,
  className,
  mentions,
  containerRef,
}: {
  editor: BaseEditor & ReactEditor & HistoryEditor
  initialValue: Descendant[]
  placeholder?: string
  className?: string
  mentions?: {
    users?: partialUser[]
    members?: Member[]
    roles?: Role[]
  }
  containerRef?: React.RefObject<HTMLElement>
}) => {
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    [],
  )

  const renderElement = useCallback((props) => <Element {...props} />, [])
  const [target, setTarget] = useState<Range | undefined>()
  const [index, setIndex] = useState(0)
  const [search, setSearch] = useState("")

  const match: typeof mentions =
    Object.entries(mentions || {}).reduce(
      (accumulator, [categoryName, categoryItem]) => {
        accumulator[categoryName] = categoryItem
          .filter((mention) => {
            if ("displayName" && "username" in mention) {
              return (
                mention.displayName
                  .toLowerCase()
                  .startsWith(search.toLowerCase()) ||
                mention.username.toLowerCase().startsWith(search.toLowerCase())
              )
            } else if ("name" in mention) {
              return mention.name.toLowerCase().startsWith(search.toLowerCase())
            } else {
              return mention.username
                .toLowerCase()
                .startsWith(search.toLowerCase())
            }
          })
          .slice(0, 10)

        return accumulator
      },
      {},
    ) ?? []

  const onKeyDown = useCallback(
    (event) => {
      if (target && Object.values(match).length > 0) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault()
            const prevIndex =
              index >= Object.values(match).length - 1 ? 0 : index + 1
            setIndex(prevIndex)
            break
          case "ArrowUp":
            event.preventDefault()
            const nextIndex =
              index <= 0 ? Object.values(match).length - 1 : index - 1
            setIndex(nextIndex)
            break
          case "Tab":
          /**          case "Enter":
            event.preventDefault()
            Transforms.select(editor, target)
            insertMention(editor, match[index], )
            setTarget(null)
            break */
          case "Escape":
            event.preventDefault()
            setTarget(null)
            break
        }
      }
    },
    [mentions, editor, index, target],
  )

  /**useEffect(() => {
    if (target && Object.values(match).length > 0) {
      const el = ref.current
      const rect = containerRef?.current?.getBoundingClientRect()
      el.style.top = `${rect.top + window.scrollY}px`
      el.style.left = `${rect.left + window.scrollX}px`
    }
  }, [Object.values(match).length, editor, index, search, target])**/

  const decorate = useCallback(([node, path]: NodeEntry) => {
    const ranges: Range[] = []

    if (!Text.isText(node)) {
      return ranges
    }

    const getLength = (token: string | Prism.Token | any) => {
      if (typeof token === "string") {
        return token.length
      } else if (typeof token.content === "string") {
        return token.content.length
      } else {
        return token.content.reduce((l, t) => l + getLength(t), 0)
      }
    }

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
    let start = 0

    for (const token of tokens) {
      const length = getLength(token)
      const end = start + length

      if (typeof token !== "string") {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        })
      }

      start = end
    }

    return ranges
  }, [])

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={() => {
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection)
          const wordBefore = Editor.before(editor, start, { unit: "word" })
          const before = wordBefore && Editor.before(editor, wordBefore)
          const beforeRange = before && Editor.range(editor, before, start)
          const beforeText = beforeRange && Editor.string(editor, beforeRange)
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/)
          const after = Editor.after(editor, start)
          const afterRange = Editor.range(editor, start, after)
          const afterText = Editor.string(editor, afterRange)
          const afterMatch = afterText.match(/^(\s|$)/)

          if (beforeMatch && afterMatch) {
            setTarget(beforeRange)
            setSearch(beforeMatch[1])
            setIndex(0)
            return
          }
        }

        setTarget(null)
      }}
    >
      <Editable
        renderElement={renderElement}
        decorate={decorate}
        renderLeaf={renderLeaf}
        autoFocus
        onKeyDown={onKeyDown}
        style={{ minHeight: 0 }}
        maxLength={2000}
        {...(placeholder && { placeholder: placeholder })}
        className={`w-full overflow-y-auto ${className}`}
      />
      {target && Object.values(match).length > 0 && (
        <MentionMenu
          mentions={match}
          containerRef={containerRef}
          index={index}
          onClick={(item) => {
            Transforms.select(editor, target)

            insertMention(editor, item.value, item.id, item.mentionType)
            setTarget(null)
          }}
        />
      )}
    </Slate>
  )
}

const insertMention = (editor, character, _id, mentionType) => {
  const mention: MentionElement = {
    type: "mention",
    character: character,
    _id: _id,
    mentionType: mentionType,
    children: [{ text: "" }],
  }
  Transforms.insertNodes(editor, mention)
  Transforms.move(editor)
}

export default MarkdownPreviewer
