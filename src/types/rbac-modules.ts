export interface RbacModuleAction {
  key: string
  label: string
  permission: string
  permission_id: number
  description: string
}

export interface RbacModule {
  key: string
  label: string
  group: string
  actions: RbacModuleAction[]
}

export interface RbacModulesCatalogData {
  modules: RbacModule[]
}
