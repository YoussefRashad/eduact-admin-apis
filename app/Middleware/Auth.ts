import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AuthService from 'App/Services/AuthService'

export default class Auth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    await AuthService.authenticate(ctx)
    await next()
  }
}
