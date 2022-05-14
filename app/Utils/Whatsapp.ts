import Env from '@ioc:Adonis/Core/Env'
import Http from './Http'

export class Whatsapp {
  static async sendMessage(number: string, message: string) {
    const token = Env.get('WHATSAPP_TOKEN')
    const instanceId = Env.get('WHATSAPP_INSTANCE_ID')
    const url = `https://api.chat-api.com/instance${instanceId}/message?token=${token}`
    const data = {
      phone: '2' + number,
      body: message,
    }
    return Http.post(url, data)
  }

  static async getServicePhoneStatus() {
    const token = Env.get('WHATSAPP_TOKEN')
    const instanceId = Env.get('WHATSAPP_INSTANCE_ID')
    const url = `https://api.chat-api.com/instance${instanceId}/status?token=${token}`
    return Http.get(url)
  }
}
