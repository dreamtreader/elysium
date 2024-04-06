import { useSelector } from "react-redux"

import { getChannelById } from "../../redux/reducers/chatReducer"

import Presentation from "./channelPresentation"
import SettingsLayout from "../../settingsLayout"
import Overwrites from "./overwrites"
import { getOpenModal } from "../../redux/reducers/UIReducer"

const settings = [
  {
    name: "General",
    children: [{ name: "Presentation" }, { name: "Permission Overwrites" }],
  },
]

const ChannelSettings = () => {
  const openModal = useSelector(getOpenModal())
  const channel = useSelector(getChannelById(openModal?.entity))

  const open = openModal?.type === "channelSettings" && channel !== undefined

  const components = [
    <Presentation channel={channel} />,
    <Overwrites entity={channel} type="channel" />,
  ]
  return <SettingsLayout open={open} list={settings} components={components} />
}

export default ChannelSettings
