import { Text } from "slate";
import Prism from "prismjs";
import "prismjs/components/prism-markdown.js";

export const editorToRawText = (node) => {
  if (Text.isText(node)) {
    return node.text;
  }
  const children = node.children.map((n) => editorToRawText(n)).join("");

  return children;
};

const TokenStreamToString = ({
  tokenStream,
  currentString = "",
  type,
  previousType,
  color,
}) => {
  if (tokenStream instanceof Prism.Token) {
    return TokenStreamToString({
      tokenStream: tokenStream.content,
      currentString: currentString,
      type: type ? type : tokenStream.type,
      previousType: tokenStream.type,
      color: color,
    });
  } else if (typeof tokenStream === "string") {
    if (tokenStream.length && previousType !== "punctuation")
      if (type == "bold")
        currentString += `<strong ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</strong>`;
      else if (type == "code")
        currentString += `<code ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</code>`;
      else if (type == "italic")
        currentString += `<em ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</em>`;
      else if (type == "underlined")
        currentString += `<u ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</u>`;
      else if (color)
        currentString += `<span ${
          color ? `class="text-${color}"` : ""
        }>${tokenStream}</span>`;
      else currentString += tokenStream;

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
    return currentString;
  } else {
    tokenStream.map((token) => {
      if (token instanceof Prism.Token)
        currentString = TokenStreamToString({
          tokenStream: token,
          currentString: currentString,
          type: type ? type : token.type,
          previousType: token.type,
          color: color,
        });
      else
        currentString = TokenStreamToString({
          tokenStream: token,
          currentString: currentString,
          type: type ? type : undefined,
          previousType: previousType ? previousType : undefined,
          color: color,
        });
    });

    return currentString;
  }
};

export const serialize = (node) => {
  if (Text.isText(node)) {
    let tokenStream = Prism.tokenize(node.text, Prism.languages.markdown);
    const content = TokenStreamToString({
      tokenStream: tokenStream,
      ...(node.color && { color: node.color }),
    });

    return content;
  }

  const children = node.children.map((n) => serialize(n)).join("");

  const style = `"text-align: ${node.align ?? "left"}"`;

  switch (node.type) {
    case "mention":
      return `<span data-cy="mention">${node._id}</span>`;
    case "heading-one":
      return `<h1 style=${style} class="text-4xl mb-2">${children}</h1>`;
    case "heading-two":
      return `<h2 style=${style} class="text-2xl mb-1">${children}</h1>`;
    case "image":
      return `<div class="w-full rounded-md flex ${
        node.align == "right"
          ? "justify-end"
          : node.align == "center"
          ? "justify-center"
          : "justify-start"
      } "><img src=${node.url} height=${node.height} /></div>`;
    case "quote":
      return `<blockquote style=${style} class="italic"><p>${children}</p></blockquote>`;
    case "paragraph":
      return `<p style=${style}>${children}</p>`;
    case "link":
      return `<a style=${style} href="${escapeHtml(node.url)}">${children}</a>`;
    default:
      return children;
  }
};
