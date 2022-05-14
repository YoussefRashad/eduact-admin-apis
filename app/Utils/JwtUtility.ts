import jwt from 'jsonwebtoken'
import Logger from '@ioc:Adonis/Core/Logger'
import Env from '@ioc:Adonis/Core/Env'

type DecodedToken = {
  id: number
  expires_at: string
  created_at: string
  updated_at: string
  uuid: string
}

export default class JwtUtility {
  public static async sign(payload): Promise<string> {
    return jwt.sign(payload, Env.get('APP_KEY'))
  }

  public static async verify(token: string): Promise<DecodedToken> {
    return jwt.verify(token, Env.get('APP_KEY'))
  }

  public static async verify_(token: string) {
    try {
      await this.verify(token)
      return true
    } catch (e) {
      return false
    }
  }

  public static async generateJwtToken(payload): Promise<string> {
    return await JwtUtility.sign(payload)
  }
}
