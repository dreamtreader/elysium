export class Formatting {
  private readonly formats = {
    strikethrough: /\~\~(.*?)\~\~/gim,
    underline: /__(.*?)__/gim,
    underlineBoldItalic: /__\*\*\*(.*?)\*\*\*__/gim,
    boldItalic: /\*\*\*(.*?)\*\*\*/gim,
    underlineBold: /__\*\*(.*?)\*\*__/gs,
    bold: /\*\*(.*)\*\*/gim,
    underlineItalic: /__\*(.*?)\*__/gs,
    italic: /\*(.*)\*/gim,
    h1: /^#(.*$)/gim,
    h2: /^##(.*$)/gim,
    h3: /^###(.*$)/gim,
    list: /^(-|\*)(.*?)/g,
    codeLine: /`(.+)`/gs,
    codeMultiline: /```(.*?)```/gs,
    spoiler: /\|\|(.*?)\|\|/gs,
    url: /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+~#?&//=]*))/gm,
  }

  public format = (content: string) => {
    const toHTML = content
      .replace(this.formats.strikethrough, "<del>$1</del>")
      .replace(this.formats.underline, "<u>$1</u>")
      .replace(this.formats.underlineBoldItalic, "<u><b><i>$1</i></b></u>")
      .replace(this.formats.boldItalic, "<b><i>$1</i></b>")
      .replace(this.formats.underlineBold, "<b><u>$1</u></b>")
      .replace(this.formats.bold, "<strong>$1</strong>")
      .replace(this.formats.underlineItalic, "<i><u>$1</u></i>")
      .replace(this.formats.h1, "h1>$1</h1>")
      .replace(this.formats.h2, "h2>$1</h2>")
      .replace(this.formats.h3, "h3>$1</h3>")
      .replace(this.formats.list, `<ul class="bulletList">$1</ul>`)
      .replace(this.formats.codeLine, "<code>$1</code>")
      .replace(this.formats.codeMultiline, "<code>$1</code>")
      .replace(this.formats.spoiler, `<span class="spoiler">$1</span>`)

    return toHTML
  }
}
