import { Role } from "../types"

export const sortByPosition = (a: Role, b: Role) =>
  a.position > b.position ? -1 : 1

export const sortByDate = (
  a: { createdAt: string },
  b: { createdAt: string },
) => {
  const dateA = new Date(a.createdAt)
  const dateB = new Date(b.createdAt)
  return dateA < dateB ? 1 : -1
}
