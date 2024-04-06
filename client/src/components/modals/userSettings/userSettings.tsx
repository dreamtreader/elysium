import { useSelector } from "react-redux"

import { isActive } from "../../redux/reducers/UIReducer"
import SettingsLayout from "../../settingsLayout"
import Profile from "./profile"
import PersonalInformation from "./personalInformation"

const settings = [
  {
    name: "Account",
    children: [{ name: "Presentation" }, { name: "Personal Information" }],
  },
]

const UserSettings = () => {
  const open: boolean = useSelector(isActive("userSettings", "openModal"))

  const components: JSX.Element[] = [<Profile />, <PersonalInformation />]

  return <SettingsLayout open={open} list={settings} components={components} />
}

export default UserSettings
