import MenuButton from "./menuButton"
const FeatureList = () => {
  return (
    <ul className=" grid grid-cols-3 py-2 gap-2 border-csblue-300">
      <MenuButton
        key="CommunityPage"
        icon={<i className="bi bi-flag"></i>}
        text="Community Page"
      />
      <MenuButton
        key="News"
        icon={<i className="bi bi-megaphone"></i>}
        text="News"
      />
      <MenuButton
        key="CommunityProfile"
        icon={<i className="bi bi-person-vcard"></i>}
        text="Community Profile"
      />
    </ul>
  )
}

export default FeatureList
