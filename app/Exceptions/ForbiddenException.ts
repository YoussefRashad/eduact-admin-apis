import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Exception } from '@poppinss/utils'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new ForbiddenException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class ForbiddenException extends Exception {
  constructor(message: string) {
    super(message, 403)
  }

  /**
   * Implement the handle method to manually handle this exception.
   * Otherwise it will be handled by the global exception handler.
   */
  public async handle(error: this, { response }: HttpContextContract) {
    response.status(error.status).send({ error: error.message })
  }
}
