import { RolesListPage } from "../roles-list-page"

const GlobalRolesPage = () => (
  <RolesListPage
    rolesBasePath="global-roles"
    title="General Roles"
    description="Manage general template roles (owner, admin, manager, etc.)"
    tableTitle="General Roles"
  />
)

export default GlobalRolesPage
