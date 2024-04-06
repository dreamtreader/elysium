export const findMentions = (
  children,
  mentionType: "user" | "role",
  mentions = [],
) => {
  children.forEach((child) => {
    if ("type" in child) {
      if (child.type === "paragraph") {
        findMentions(child.children, mentionType, mentions)
      } else {
        if (child.type === "mention" && child.mentionType == mentionType) {
          mentions.push(child)
        }
      }
    }
  })
  return mentions
}
