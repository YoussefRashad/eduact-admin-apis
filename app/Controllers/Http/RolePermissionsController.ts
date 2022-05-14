import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateRoleValidator from 'App/Validators/RoleValidators/CreateRoleValidator'
import RoleService from 'App/Services/RolePermissionService'
import Http from 'App/Utils/Http'
import UpdateRoleValidator from 'App/Validators/RoleValidators/UpdateRoleValidator'
import GetRoleValidator from 'App/Validators/RoleValidators/GetRoleValidator'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import AssignRoleValidator from 'App/Validators/RoleValidators/AssignRoleValidator'
import PermissionGroup from "App/Models/PermissionGroup";

export default class RolePermissionsController {
  roleService = new RoleService()
  /**
   * @param param0
   * @returns
   */
  public async create({ request, response }: HttpContextContract) {
    const { permissions, ...rest } = await request.validate(CreateRoleValidator)
    const result = await this.roleService.createRole(rest, permissions)
    return Http.respond(response, 'Create Role with its permissions', result)
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async update({ request, response }: HttpContextContract) {
    const { id, permissions, ...rest } = await request.validate(UpdateRoleValidator)
    const result = await this.roleService.updateRole(id, rest, permissions)
    return Http.respond(response, 'Update Role with its permissions', result)
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async get({ request, response }: HttpContextContract) {
    const { id } = await request.validate(GetRoleValidator)
    const role = await this.roleService.getRoleOrFail(id)
    return Http.respond(response, 'Get Role', role)
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async fetch({ request, response }: HttpContextContract) {
    const requestQuery = await request.validate(GeneralAllValidator)
    const roles = await this.roleService.fetchRoles(requestQuery)
    return Http.respond(response, 'Fetch Roles', roles.toJSON().data, roles.toJSON().meta)
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async delete({ request, response }: HttpContextContract) {
    const { id } = await request.validate(GetRoleValidator)
    const role = await this.roleService.deleteRole(id)
    return Http.respond(response, 'Delete Roles', role)
  }
  /**
   *
   * @param param0
   * @returns
   */
  public async assign({ request, response }: HttpContextContract) {
    const { admin_id, roles } = await request.validate(AssignRoleValidator)
    const result = await this.roleService.assignRole(admin_id, roles)
    return Http.respond(response, 'Assign Roles', result)
  }

  /**
   *
   * @param response
   */
  public async allPermissions({response}: HttpContextContract) {
    const permissions = await PermissionGroup.query().preload('permissions')
    return Http.respond(response, 'Fetch permissions', permissions)
  }
}
