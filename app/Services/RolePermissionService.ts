import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import Role from '../Models/Role'
import Utils from '../Utils/Utils'
import Admin from '../Models/Admin'
import PermissionGroup from '../Models/PermissionGroup'

export default class RolePermissionService {
  /**
   *
   * @param role
   * @param permissions id of permissions
   * @returns
   */
  public async createRole(role: Partial<Role>, permissions: number[]) {
    const uuid = Utils.generateUUID()
    const roleResult = await Role.create({ ...role, uuid })
    await roleResult.related('permissions').sync(permissions)
    return roleResult
  }
  /**
   *
   * @param id
   * @param role
   * @param permissions id of permissions
   * @returns
   */
  public async updateRole(id: number, role: Partial<Role>, permissions: number[] | undefined) {
    const roleResult = await Role.findOrFail(id)
    await roleResult.merge(role).save()
    if (permissions) await roleResult.related('permissions').sync(permissions)
    return roleResult
  }

  /**
   *
   * @returns
   * @param role_id
   */
  public async getRoleOrFail(role_id: number) {
    return Role.query().preload('permissions').where('id', role_id).firstOrFail()
  }

  /**
   *
   * @param role_id
   */
  public async getPermissionGroups(role_id: number) {
    const permission_groups = await PermissionGroup.query()
      .select('permissions.*', 'permission_groups.id', 'permission_groups.*')
      .leftJoin('permissions', 'permission_groups.id', 'permissions.group_id')
      .leftJoin('role_permissions', 'permissions.id', 'role_permissions.permission_id')
      .leftJoin('roles', 'role_permissions.role_id', 'roles.id')
      .where('roles.id', role_id)
      .preload('permissions', (query) => {
        query.whereHas('permission_roles', (query) => query.where('role_permissions.role_id', role_id))
      })
    const result = [
      ...new Map(
        permission_groups.map((per_group) => {
          return [per_group['id'], per_group]
        })
      ).values(),
    ]
    return result
  }
  /**
   *
   * @param queryParams
   * @returns
   */
  public async fetchRoles(queryParams: any) {
    const { page, perPage, from, to, filters, sortBy, query } = queryParams
    const searchColumns = ['uuid', 'title', 'description']
    const roleQuery = Role.query()
    ControllersUtils.applyAllQueryUtils(roleQuery, from, to, filters, sortBy, searchColumns, query)
    return roleQuery.preload('permissions').paginate(page, perPage)
  }
  /**
   *
   * @param id
   * @returns
   */
  public async deleteRole(id: number) {
    const roleQuery = await Role.findByOrFail('id', id)
    await roleQuery.related('permissions').detach()
    await roleQuery.delete()
    return roleQuery
  }
  /**
   *
   * @param admin_id
   * @param roles id of roles
   * @returns
   */
  public async assignRole(admin_id: number, roles: number[]) {
    const admin = await Admin.findOrFail(admin_id)
    await admin.related('roles').sync(roles)
    return admin
  }
}
