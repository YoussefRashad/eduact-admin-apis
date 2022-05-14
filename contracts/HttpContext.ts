declare module '@ioc:Adonis/Core/HttpContext' {
  import { CtxAuth } from 'App/Services/AuthService'
  interface HttpContextContract {
    auth: CtxAuth
  }
}
