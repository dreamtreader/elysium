import {
  isActive,
  componentClosed,
  saveChangesOpened,
} from "../../redux/reducers/UIReducer"

import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import {
  Channel,
  Member,
  Overwrite,
  Role,
  Topic,
  fullMember,
} from "../../../types"
import SaveChanges from "../saveChangesNew"

import { socket } from "../../../socket/socketInitializer"
import PermService from "../../../lib/perms"
import {
  getSelfAsMember,
  getServerMembers,
} from "../../redux/reducers/memberReducer"
import { store } from "../../redux/store"
import { getServerRoles } from "../../redux/reducers/roleReducer"
import { getServerById } from "../../redux/reducers/chatReducer"
import Permissions from "./permissions"
import Selector from "./overwriteSelector"

const OverwriteSection = ({
  overwrite,
  editOverwrite,
  locked,
}: {
  overwrite: Overwrite
  editOverwrite: (
    id: string,
    { allow, deny }: { allow?: number; deny?: number },
  ) => any
  locked: boolean
}) => {
  return (
    <div className="w-full min-h-screen overflow-y-auto pt-[60px] p-4">
      <div className="py-4 overflow-auto">
        <div>
          {locked ? (
            <h1>
              {`You are not allowed to view or change this ${
                overwrite.type === 0 ? "role" : "member"
              }'s overwrites `}
            </h1>
          ) : (
            <Permissions
              overwrite={overwrite}
              setPerms={({ allow, deny }) =>
                editOverwrite(overwrite.id, { allow: allow, deny: deny })
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

const Overwrites = ({
  entity,
  type,
}: {
  entity: Topic | Channel
  type: "topic" | "channel"
}) => {
  const dispatch = useDispatch()
  const saveChangesOpen: boolean = useSelector(isActive(true, "saveChanges"))

  const server = useSelector(getServerById(entity?.serverId))
  const member = useSelector(getSelfAsMember(entity?.serverId))
  const members =
    useSelector(getServerMembers(entity?.serverId)).reduce(
      (a: any, v: Member) => {
        return {
          ...a,
          [v._id]: v,
        }
      },
      {},
    ) ?? {}
  const roles =
    useSelector(getServerRoles(entity?.serverId)).reduce((a: any, v: Role) => {
      return {
        ...a,
        [v._id]: v,
      }
    }, {}) ?? {}

  const overwrites =
    entity?.permissionOverwrites?.reduce((a: any, v: Overwrite) => {
      return {
        ...a,
        [v.id]: v,
      }
    }, {}) ?? {}

  const [activeId, setActiveId] = useState("")

  const [editedOverwriteIds, setEditedOverwriteIds] = useState<{
    [id: string]: true
  }>({})
  const [formState, setFormState] = useState<{ [key: string]: Overwrite }>(
    overwrites,
  )

  const perms = new PermService(store.getState())

  const areNotEqual = (
    editedOverwrite: Overwrite,
    initialOverwrite: Overwrite,
  ) =>
    editedOverwrite.allow !== initialOverwrite.allow ||
    editedOverwrite.deny !== initialOverwrite.deny

  const inequalityCondition = (
    editedOverwrite?: Overwrite,
    initialOverwrite?: Overwrite,
  ) =>
    editedOverwrite && initialOverwrite
      ? areNotEqual(editedOverwrite, initialOverwrite) ||
        Object.keys(editedOverwriteIds).length
      : Object.keys(editedOverwriteIds).length

  useEffect(() => {
    setFormState({ ...overwrites, ...formState })
  }, [entity?.permissionOverwrites])

  useEffect(() => {
    const editedOverwrite = formState[activeId]
    const initialOverwrite = overwrites[activeId]

    if (inequalityCondition(editedOverwrite, initialOverwrite)) {
      if (!saveChangesOpen) dispatch(saveChangesOpened(true))
    } else if (saveChangesOpen) {
      dispatch(componentClosed("saveChanges"))
    }
  }, [formState])

  const editOverwrite = (id: string, { allow, deny }) => {
    const editedOverwrite = {
      ...formState[id],
      allow: allow,
      deny: deny,
    }
    const initialOverwrite = overwrites[activeId]

    if (!initialOverwrite) {
      if (!editedOverwriteIds[activeId])
        setEditedOverwriteIds({ ...editedOverwriteIds, [activeId]: true })
    } else if (
      !editedOverwriteIds[activeId] &&
      areNotEqual(editedOverwrite, initialOverwrite)
    )
      setEditedOverwriteIds({ ...editedOverwriteIds, [activeId]: true })
    else if (
      editedOverwriteIds[activeId] &&
      !areNotEqual(editedOverwrite, initialOverwrite)
    ) {
      const newEditedOverwriteIds = editedOverwriteIds
      delete newEditedOverwriteIds[activeId]
      setEditedOverwriteIds(newEditedOverwriteIds)
    }

    setFormState({
      ...formState,
      [id]: editedOverwrite,
    })
  }

  const addOverwrite = (id: string, type: 0 | 1) => {
    setFormState({
      ...formState,
      [id]: { type: type, id: id, allow: 0, deny: 0 },
    })
    setEditedOverwriteIds({ ...editedOverwriteIds, [id]: true })
  }

  const checkOverwriteAccess = (overwrite: Overwrite) => {
    if (overwrite.type === 0) {
      return (
        perms.getHighestRole(member, entity?.serverId)?.position <
          roles[overwrite.id]?.position && member.userId !== server.ownerId
      )
    } else {
      perms.getHighestRole(member, entity?.serverId)?.position <
        perms.getHighestRole(members[overwrite.id], entity.serverId)
          ?.position && member.userId !== server.ownerId
    }
  }

  return (
    <div className="max-w-[740px] min-h-[460px] grow shrink flex h-full">
      <div className="min-w-[100%] grid grid-cols-[218px,_1fr]">
        <ul className="border-r-[1px] border-csblue-400 flex flex-col gap-1  p-4 pt-20">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-cspink-50 font-bold text-xl">Overwrites</h1>
            <Selector
              onSelect={(_id, type) => addOverwrite(_id, type)}
              members={members}
              roles={roles}
            />
          </div>
          {Object.values(formState).map((overwrite: Overwrite) => {
            const entity =
              overwrite.type === 0 ? roles[overwrite.id] : members[overwrite.id]

            return (
              <button
                key={overwrite.id}
                onClick={(e) => setActiveId(overwrite.id)}
                className={` p-2 flex items-center gap-2 px-4 w-full text-cspink-50 rounded-md text-start ${
                  overwrite.id !== activeId
                    ? ` hover:bg-csblue-150`
                    : `bg-csblue-100`
                }`}
              >
                <span
                  style={{
                    ...(overwrite.type === 0 && {
                      backgroundColor: (entity as Role)?.color,
                    }),
                    ...(overwrite.type === 1 && {
                      backgroundImage: `url(${(entity as fullMember)?.avatar})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }),
                  }}
                  className="w-4 aspect-square rounded-full inline-block"
                />
                {checkOverwriteAccess(overwrite) ? (
                  <i className="bi bi-lock-fill"></i>
                ) : null}
                {entity?.name || entity?.username}
              </button>
            )
          })}
        </ul>
        {formState[activeId] ? (
          <OverwriteSection
            overwrite={formState[activeId]}
            editOverwrite={editOverwrite}
            locked={checkOverwriteAccess(formState[activeId])}
          />
        ) : null}
      </div>
      <SaveChanges
        onSave={() => {
          if (type == "topic")
            socket.emit("topicChanged", {
              permissionOverwrites: [...Object.values(formState)],
              serverId: entity?.serverId,
              topicId: entity?._id,
            })
          else
            socket.emit("serverChannelChanged", {
              permissionOverwrites: [...Object.values(formState)],
              serverId: entity?.serverId,
              channelId: entity?._id,
            })
        }}
        onReset={() => {
          setFormState(overwrites)
          setEditedOverwriteIds({})
        }}
      />
    </div>
  )
}

export default Overwrites
