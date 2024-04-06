import escapeHtml from "escape-html"
import { Text } from "slate"
import { jsx } from "slate-hyperscript"
import Prism from "prismjs"
import "prismjs/components/prism-markdown"
import { getUserById } from "../redux/reducers/chatReducer"
import { store } from "../redux/store"
import { getRoleById } from "../redux/reducers/roleReducer"

const TokenStreamToString = ({
  tokenStream,
  currentString = "",
  type,
  previousType,
  color,
}: {
  color?: string
  tokenStream: Prism.TokenStream
  currentString?: string
  type?: string
  previousType?: string
}) => {
  if (tokenStream instanceof Prism.Token) {
    return TokenStreamToString({
      tokenStream: tokenStream.content,
      currentString: currentString,
      type: type ? type : tokenStream.type,
      previousType: tokenStream.type,
      color: color,
    })
  } else if (typeof tokenStream === "string") {
    if (tokenStream.length && previousType !== "punctuation")
      if (type == "bold")
        currentString += `<strong ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</strong>`
      else if (type == "code")
        currentString += `<code ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</code>`
      else if (type == "italic")
        currentString += `<em ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</em>`
      else if (type == "underlined")
        currentString += `<u ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</u>`
      else if (color)
        currentString += `<span ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</span>`
      else currentString += tokenStream

    /**  switch (type) {
      case "bold":
        currentString += `<strong>${tokenStream}</strong>`
      case "code":
        currentString += `<code>${tokenStream}</code>`
      case "italic":
        currentString += `<italic>${tokenStream}</italic>`
      case "underlined":
        currentString += `<u>${tokenStream}</u>`
      default:
        currentString += tokenStream
    }**/
    return currentString
  } else {
    tokenStream.map((token) => {
      if (token instanceof Prism.Token)
        currentString = TokenStreamToString({
          tokenStream: token,
          currentString: currentString,
          type: type ? type : token.type,
          previousType: token.type,
          color: color,
        })
      else
        currentString = TokenStreamToString({
          tokenStream: token,
          currentString: currentString,
          type: type ? type : undefined,
          previousType: previousType ? previousType : undefined,
          color: color,
        })
    })

    return currentString
  }
}
export const editorToRawText = (node) => {
  if (Text.isText(node)) {
    return node.text
  }
  const children = node.children.map((n) => editorToRawText(n)).join("")

  return children
}

export const serialize = (node) => {
  if (Text.isText(node)) {
    let tokenStream = Prism.tokenize(node.text, Prism.languages.markdown)
    const content = TokenStreamToString({
      tokenStream: tokenStream,
      ...(node.color && { color: node.color }),
    })

    return content
  }

  const children = node.children.map((n) => serialize(n)).join("")

  const style = `"text-align: ${node.align ?? "left"}"`

  switch (node.type) {
    case "mention":
      return `<span data-cy="mention">${node._id}</span>`
    case "heading-one":
      return `<h1 style=${style} class="text-4xl mb-2">${children}</h1>`
    case "heading-two":
      return `<h2 style=${style} class="text-2xl mb-1">${children}</h1>`
    case "image":
      return `<div class="w-full flex ${
        node.align == "right"
          ? "justify-end"
          : node.align == "center"
          ? "justify-center"
          : "justify-start"
      } "><img src=${node.url} height=${node.height} /></div>`
    case "quote":
      return `<blockquote style=${style} class="italic"><p>${children}</p></blockquote>`
    case "paragraph":
      return `<p style=${style}>${children}</p>`
    case "link":
      return `<a style=${style} href="${escapeHtml(node.url)}">${children}</a>`
    default:
      return children
  }
}

export const deserialize = (
  el,
  mentions = [],
  mentionedRoles = [],
  markAttributes: any = {},
) => {
  if (el.nodeType === Node.TEXT_NODE) {
    return jsx("text", markAttributes, el.textContent)
  } else if (el.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const nodeAttributes = { ...markAttributes }

  // define attributes for text nodes
  switch (el.nodeName) {
    case "STRONG":
      nodeAttributes.bold = true
    case "ITALIC":
      nodeAttributes.italic = true
  }

  const children = Array.from(el.childNodes)
    .map((node) => deserialize(node, mentions, mentionedRoles, nodeAttributes))
    .flat()

  if (children.length === 0) {
    children.push(jsx("text", nodeAttributes, ""))
  }

  switch (el.nodeName) {
    case "SPAN":
      if (el.getAttribute("data-cy").includes("mention")) {
        const state = store.getState()
        if (mentions.includes(el.textContent)) {
          const user = getUserById(el.textContent)(state)
          if (user) {
            return jsx(
              "element",
              {
                type: "mention",
                _id: el.textContent,
                character: user.username,
                mentionType: "user",
              },
              [{ text: "" }],
            )
          } else {
            /**const fetchedUser = await fetchUser(el.textContent, dispatch)
            if (fetchedUser)
              return jsx(
                "element",
                {
                  type: "mention",
                  _id: el.textContent,
                  character: fetchedUser.username,
                  mentionType: "user",
                },
                [],
              )
            else
              return jsx(
                "element",
                {
                  type: "mention",
                  _id: el.textContent,
                  character: "Unknown",
                  mentionType: "user",
                },
                [],
              ) **/
          }
        } else if (mentionedRoles.includes(el.textContent)) {
          const role = getRoleById(el.textContent)(state)
          if (role)
            return jsx(
              "element",
              {
                type: "mention",
                _id: el.textContent,
                character: role.name,
                mentionType: "role",
              },
              [],
            )
          else
            return jsx(
              "element",
              {
                type: "mention",
                _id: el.textContent,
                character: "Unknown",
                mentionType: "role",
              },
              [],
            )
        }
      } else return children

    case "BODY":
      return jsx("fragment", {}, children)
    case "BR":
      return "\n"
    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children)
    case "P":
      return jsx("element", { type: "paragraph" }, children)
    case "A":
      return jsx(
        "element",
        { type: "link", url: el.getAttribute("href") },
        children,
      )
    default:
      return children
  }
}
