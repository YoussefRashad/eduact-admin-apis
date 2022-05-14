import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
  }

  public async ready() {
    // App is ready
    const { CtxAuth } = await import('App/Services/AuthService') // importing AuthService here because it's inside the app folder
    const HttpContext = this.app.container.use('Adonis/Core/HttpContext')
    // @ts-ignore
    HttpContext.macro('auth', new CtxAuth())
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
