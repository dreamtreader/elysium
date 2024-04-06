import { Descendant } from "slate"
import {
  Mention as MentionedUser,
  MentionedRole,
} from "../components/chat/mention"
import { renderToStaticMarkup, renderToString } from "react-dom/server"
import { useSelector } from "react-redux"
import { getUserById } from "../components/redux/reducers/chatReducer"
import { store } from "../components/redux/store"
import { getRoleById } from "../components/redux/reducers/roleReducer"

export class Mention {
  public addMentions = (
    content: string,
    channelType: number,
    mentions?: string[],
    mentionedRoles?: string[],
  ) => {
    var toHTML = content
    const state = store.getState()
    for (const mention of mentions) {
      const user = getUserById(mention)(state)

      toHTML = toHTML.replace(
        `<span data-cy="mention">${mention}</span>`,
        `<a class="pt-[3px] pr-[3px] pb-[2px] mt-0 mr-[1px] rounded-[4px] bg-sky-500/50 cursor-pointer text-cspink-50"> @` +
          (user.username ?? "Not found") +
          `</a>`,
      )
    }

    for (const mention of mentionedRoles) {
      const role = getRoleById(mention)(state)
      toHTML = toHTML.replace(
        `<span data-cy="mention">${mention}</span>`,
        `<a class="pt-[3px] pr-[3px] pb-[2px] mt-0 mr-[1px] rounded-[4px] bg-sky-500/50 cursor-pointer text-cspink-50"> @` +
          (role.name ?? "Not found") +
          `</a>`,
      )
    }
    return toHTML
  }
  public convertStringToSlate = (
    content: string,
    mentions: string[] = [],
    mentionedRoles: string[] = [],
  ) => {
    const descendants: Descendant[] = []
    const mentionIndexes = []
    mentions.forEach((mention, index) => {
      mentionIndexes.push(
        content.indexOf(mention, index !== 0 ? mentionIndexes[index - 1] : 0),
      )
    })
    for (let i = 0; i < mentions.length; i++) {
      let start = i !== 0 ? mentionIndexes[i - 1] + mentions[i - 1].length : 0
      let end = mentionIndexes[i]
      descendants.push({
        type: "paragraph",
        children: [{ text: content.slice(start, end) }],
      })
      descendants.push({
        type: "mention",
        children: [{ text: "" }],
        character: content.slice(start, end),
        _id: mentions[i],
        mentionType: "user",
      })
    }
    return descendants
  }
}
