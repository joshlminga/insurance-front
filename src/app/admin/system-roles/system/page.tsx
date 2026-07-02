import { RolesListPage } from "../roles-list-page"

const SystemRolesPage = () => (
  <RolesListPage
    rolesBasePath="system-roles"
    title="System Roles"
    description="Manage platform system roles (super admin, etc.)"
    tableTitle="System Roles"
  />
)

export default SystemRolesPage
