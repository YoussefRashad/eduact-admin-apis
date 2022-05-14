import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Admin from 'App/Models/Admin'
import AuthService from 'App/Services/AuthService'
import AdminLoginValidator from 'App/Validators/AdminValidators/AdminLoginValidator'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import AdminFindValidator from 'App/Validators/AdminValidators/AdminFindValidator'
import AdminCreateValidator from 'App/Validators/AdminValidators/AdminCreateValidator'
import AdminUpdateValidator from 'App/Validators/AdminValidators/AdminUpdateValidator'
import GeneralAllValidator from 'App/Validators/GeneralAllValidator'
import AdminDeleteValidator from 'App/Validators/AdminValidators/AdminDeleteValidator'
import Http from 'App/Utils/Http'
import RolePermissionService from '../../Services/RolePermissionService'
import AdminRole from '../../Models/AdminRole'

export default class AdminsController {
  rolePermissionService = new RolePermissionService()
  public async login({ request }: HttpContextContract) {
    const { email, password } = await request.validate(new AdminLoginValidator())
    const admin = await Admin.findBy('email', email)
    if (!admin) {
      throw new UnAuthorizedException('User not found')
    }
    const token = await AuthService.attempt(email, password)
    return { token, admin }
  }

  /**
   *
   * @param request
   * @param response
   * @param auth
   */
  public async all({ request, response, auth }: HttpContextContract) {
    const { filters, from, to, sortBy, page, perPage, query } = await request.validate(new GeneralAllValidator())
    const adminQuery = Admin.query()
    const searchColumns = ['email', 'uuid', 'username', 'phone_number', 'first_name', 'last_name']
    ControllersUtils.applyAllQueryUtils(adminQuery, from, to, filters, sortBy, searchColumns, query)
    adminQuery.whereNot('type', 'super')
    const admins = await adminQuery
      .preload('roles', (roleQuery) => {
        roleQuery.preload('permissions')
      })
      .paginate(page, perPage)
    return Http.respond(response, 'admins', admins.toJSON().data, admins.toJSON().meta)
  }

  /**
   * get single admin
   */
  public async admin({ request, response }: HttpContextContract) {
    const { uuid } = await request.validate(new AdminFindValidator())
    const admin = await Admin.findByOrFail('uuid', uuid)
    await admin.load('logs')
    const admin_roles = await AdminRole.query().where('admin_id', admin.id)
    const roles = await Promise.all(
      admin_roles.map(async (role) => {
        const permission_groups = await this.rolePermissionService.getPermissionGroups(role.role_id)
        return {
          ...role.$attributes,
          permission_groups,
        }
      })
    )
    return Http.respond(response, 'admin', {
      ...admin.toJSON(),
      admin_roles: roles,
    })
  }

  // FIXME: password is to long for var(60) as Hash.make() method return a hashed string with size 72 not 60
  // FIXME: updated the staging database to size 72 **without migration**
  public async create({ request, response, auth }: HttpContextContract) {
    const reqBody = await request.validate(AdminCreateValidator)
    const admin = await Admin.create_(reqBody)
    await Admin.logAction(auth.id, 'create new admin', 'create_admin', `Created admin ${admin.username}`)
    return Http.respond(response, 'admin', admin)
  }

  /**
   *
   * @param request
   * @param response
   * @param auth
   */
  public async update({ request, response, auth }: HttpContextContract) {
    const { roles, ...rest } = await request.validate(AdminUpdateValidator) // FIXME: password hashing is bigger than var(60)
    const admin = await Admin.findByOrFail('uuid', rest.uuid)
    await Admin.logAction(auth.id, 'update admin', 'update_admin', `Updated admin ${admin.username}`)
    await admin.merge(rest).save()
    if (roles) await admin.related('roles').sync(roles)
    return Http.respond(response, 'admin', admin)
  }

  /**
   *
   * @param request
   * @param response
   * @param auth
   */
  public async delete({ request, response, auth }: HttpContextContract) {
    const { uuid } = await request.validate(new AdminDeleteValidator())
    const deletedAdmin = await Admin.findByOrFail('uuid', uuid)
    await deletedAdmin.related('roles').detach()
    await deletedAdmin.delete()
    await Admin.logAction(auth.id, 'delete admin', 'delete_admin', `Deleted admin ${uuid}`)
    return Http.respond(response, 'admin', deletedAdmin)
  }

  public async cron() {} // TODO: admins cronjob
}
