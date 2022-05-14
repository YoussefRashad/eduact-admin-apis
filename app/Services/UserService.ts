import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import User from '../Models/User'

export default class UserService {
  public static async findByOrFail(field, value) {
    const user = await User.findBy(field, value)
    if (!user) throw new ResourceNotFoundException('User not found')
    return user
  }
}
