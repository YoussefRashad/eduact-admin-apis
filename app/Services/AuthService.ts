import JwtUtility from 'App/Utils/JwtUtility'
import Admin from 'App/Models/Admin'
import UnAuthorizedException from 'App/Exceptions/UnAuthorizedException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthService {
  public static async authenticate(ctx: HttpContextContract) {
    const { request } = ctx
    let authHeader = request.header('authorization', null)
    if (!authHeader) throw new UnAuthorizedException('jwt token is missing')
    const token = authHeader.split(' ')[1]
    if (!token) throw new UnAuthorizedException("couldn't parse jwt token from request headers")
    try {
      const obj = await JwtUtility.verify(token)
      ctx.auth = new CtxAuth(obj.uuid, obj.id, true)
    } catch (e) {
      throw new UnAuthorizedException('invalid jwt token')
    }
  }

  public static async attempt(email, password) {
    const admin = await Admin.findBy('email', email)
    if (!admin) {
      throw new UnAuthorizedException('User not found')
    }
    if (!(await Hash.verify(admin.password, password)))
      throw new UnAuthorizedException('login attempt failed, wrong credentials (username or password)')
    return await JwtUtility.generateJwtToken({ uuid: admin.uuid, id: admin.id })
  }
}

export class CtxAuth {
  public uuid: string | null
  public isAuthenticated: boolean
  public id: number

  constructor(uuid: string | null = null, id: number, isAuthenticated: boolean = false) {
    this.uuid = uuid
    this.isAuthenticated = isAuthenticated
    this.id = id
  }

  public async getUser() {
    return await Admin.findByOrFail('uuid', this.uuid)
  }

  public async attempt(email, password) {
    return AuthService.attempt(email, password)
  }

  public async isLoggedIn() {
    return !!this.uuid
  }
}
