import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import Admin from 'App/Models/Admin'
export default class Can {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, permissionCodes: string[]) {
    const hasPermission = await Admin.query()
      .where('admins.id', ctx.auth.id)
      .whereHas('roles', (rolesQuery) => {
        rolesQuery.whereHas('permissions', (permissionQuery) => {
          permissionQuery.where('code', permissionCodes[0])
        })
      })
      .first()
    if (!hasPermission) {
      throw new ForbiddenException('Admin does not have a permission to do this operation')
    }
    await next()
  }
}
