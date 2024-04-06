import { css, cx } from "@emotion/css"
import {
  useSelected,
  useFocused,
  RenderLeafProps,
  useSlateStatic,
  ReactEditor,
} from "slate-react"

import React, { Ref, PropsWithChildren, useState, useRef } from "react"
import { Transforms } from "slate"

interface BaseProps {
  className: string
  [key: string]: unknown
}
type OrNull<T> = T | null

export const Element = (props) => {
  const { attributes, children, element } = props
  const style = { textAlign: element.align }

  switch (element.type) {
    case "mention":
      return <Mention {...props} />
    case "block-quote":
      return (
        <blockquote
          className="italic text-csblue-50"
          style={style}
          {...attributes}
        >
          {children}
        </blockquote>
      )
    case "image":
      return <Image {...props} />
    case "bulleted-list":
      return (
        <ul
          className="ul"
          style={{ ...style, listStyleType: "circle" }}
          {...attributes}
        >
          {children}
        </ul>
      )
    case "heading-one":
      return (
        <h1 className="text-4xl mb-2" style={style} {...attributes}>
          {children}
        </h1>
      )
    case "heading-two":
      return (
        <h2 className="text-2xl mb-1" style={style} {...attributes}>
          {children}
        </h2>
      )
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case "numbered-list":
      return (
        <ol className="ol" style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
}

export const Resizer = ({
  container,
  direction,
  className,
  imgRef,
  divRef,
  editor,
  path,
}: {
  container: HTMLElement
  direction: "se" | "sw" | "nesw" | "nwse"
  className: string
  imgRef: React.RefObject<HTMLImageElement>
  divRef: React.RefObject<HTMLDivElement>
  editor
  path
}) => {
  const [startDrag, setStartDrag] = useState(0)

  return (
    <div
      draggable
      onDragStart={(e) => {
        setStartDrag(e.pageY)
      }}
      onDrag={(e) => {
        e.preventDefault()
        const newHeight = divRef.current?.clientHeight + (e.clientY - startDrag)
        const newWidth = imgRef.current?.clientWidth + (e.clientY - startDrag)

        if (newWidth <= divRef.current?.clientWidth && newHeight >= 10) {
          /**setWidth(newWidth) **/
          Transforms.setNodes(editor, { height: newHeight }, { at: path })
        }
        setStartDrag(e.clientY)
      }}
      style={{
        cursor: `${direction}-resize`,
      }}
      className={`shadow-[rgba(0,_0,_0,_0.35)_0px_5px_15px] rounded w-4 h-4 bg-cspink-50 ${className}`}
    />
  )
}

export const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, element)

  const selected = useSelected()
  const focused = useFocused()

  const container = ReactEditor.toDOMNode(editor, editor)

  const divRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  return (
    <div {...attributes} draggable="false">
      {children}
      <div
        ref={divRef}
        style={{
          width: "100%",
          ...(element.height && { height: element.height }),
        }}
        contentEditable={false}
        className={`flex ${
          element.align == "left"
            ? `justify-start`
            : element.align == "right"
            ? `justify-end`
            : element.align == "center"
            ? `justify-center`
            : null
        } relative rounded ${
          selected && focused ? `shadow-[0_0_0_3px_#B4D5FF]` : null
        }`}
      >
        <img
          src={element.url}
          ref={imgRef}
          {...attributes.style}
          className={
            css`
              display: block;
              height: 100%;
            ` + " rounded"
          }
        />
        <Resizer
          editor={editor}
          path={path}
          imgRef={imgRef}
          divRef={divRef}
          container={container}
          className={`${
            selected && focused ? "block" : "hidden"
          } absolute left-[0%] top-[0%] translate-x-[-50%] translate-y-[-50%]`}
          direction="se"
        />
        <Resizer
          editor={editor}
          path={path}
          imgRef={imgRef}
          divRef={divRef}
          container={container}
          className={`${
            selected && focused ? "block" : "hidden"
          } absolute left-[100%] top-[0%] translate-x-[-50%] translate-y-[-50%]`}
          direction="sw"
        />
        <Resizer
          editor={editor}
          path={path}
          imgRef={imgRef}
          divRef={divRef}
          container={container}
          className={`${
            selected && focused ? "block" : "hidden"
          } absolute left-[0%] top-[100%] translate-x-[-50%] translate-y-[-50%]`}
          direction="nesw"
        />
        <Resizer
          editor={editor}
          path={path}
          imgRef={imgRef}
          divRef={divRef}
          container={container}
          className={`${
            selected && focused ? "block" : "hidden"
          } absolute left-[100%] top-[100%] translate-x-[-50%] translate-y-[-50%]`}
          direction="nwse"
        />

        <div
          className={`${
            selected && focused ? "block" : "hidden"
          } z-[200] absolute flex rounded translate-x-[-50%] top-[0%] translate-y-[-50%] bg-csblue-500 left-[50%]`}
        >
          <Button
            active
            onClick={() => Transforms.removeNodes(editor, { at: path })}
            className={`w-8 aspect-square text-lg rounded-md`}
          >
            <i className="bi bi-trash-fill text-cspink-50"></i>
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Mention = ({ attributes, children, element }) => {
  const selected = useSelected()
  const focused = useFocused()
  const style: React.CSSProperties = {
    padding: "3px 3px 2px",
    margin: "0 1px",
    verticalAlign: "baseline",
    display: "inline-block",
    borderRadius: "4px",
    fontSize: "0.9em",
    boxShadow: selected && focused ? "0 0 0 2px #B4D5FF" : "none",
    backgroundColor: "rgba(80, 151, 247, 0.56)",
  }
  /** if (element.children[0].bold) {
    style.fontWeight = "bold"
  }
  if (element.children[0].italic) {
    style.fontStyle = "italic"
  } **/

  return (
    <span
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.character}`}
      style={style}
    >
      <span className="text-cspink-50 opacity-100">@{element.character}</span>
      {children}
    </span>
  )
}

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  return (
    <span
      {...attributes}
      className={`${css`
        font-weight: ${leaf.bold && "bold"};
        font-style: ${leaf.italic && "italic"};
        text-decoration: ${leaf.underline && "underline"};
        ${leaf.title &&
        css`
          display: inline-block;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0 10px 0;
        `}
        ${leaf.list &&
        css`
          padding-left: 10px;
          font-size: 20px;
          line-height: 10px;
          !list-style: inside;
        `}
          ${leaf.hr &&
        css`
          display: block;
          text-align: center;
          border-bottom: 2px solid #ddd;
        `}
          ${leaf.blockquote &&
        css`
          display: inline-block;
          border-left: 2px solid #ddd;
          padding-left: 10px;
          color: #aaa;
          font-style: italic;
        `}
          ${leaf.code &&
        css`
          font-family: monospace;
          background-color: #2b2d31;
          border-width: 1px;
          border-radius: 4px;
          border-color: #1c1c24;
          color: #b0b9ca;
          padding: 3px;
        `};
      `} ${leaf.color ? `text-${leaf.color}` : ``} `}
    >
      {children}
    </span>
  )
}

export const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean
        reversed: boolean
      } & BaseProps
    >,
    ref: Ref<OrNull<HTMLSpanElement>>,
  ) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
            ? active
              ? "white"
              : "#aaa"
            : active
            ? "#fea1bf"
            : "#ccc"};
        `,
        "flex items-center justify-center",
      )}
    />
  ),
)

export const IconComp = ({ icon }: { icon: string }) => (
  <i
    className={cx(
      css`
        font-size: 18px;
        vertical-align: text-bottom;
      `,
      icon,
    )}
  />
)
