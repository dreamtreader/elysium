export type FormattedText = {
  text: string
  bold?: true
  italic?: true
  underline?: true
  list?: true
  blockquote?: true
  code?: true
  title?: true
  hr?: true
  color?: string
}

export type ParagraphElement = {
  type: "paragraph"
  children: FormattedText[] | MentionElement[] | ImageElement[]
  align?: string
}

export type ImageElement = {
  type: "image"
  align?: string
  children: FormattedText[]
  height: number
  url: string
}

export type MentionElement = {
  type: "mention"
  character: string
  _id: string
  mentionType: "user" | "role"
  children: FormattedText[]
  align?: string
}
