import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import WalletModificationValidator from 'App/Validators/StudentValidators/WalletModificationValidator'
import User from 'App/Models/User'
import StudentService from 'App/Services/StudentService'
import Admin from 'App/Models/Admin'
import CustomException from 'App/Exceptions/CustomException'
import Http from 'App/Utils/Http'

export default class StudentWalletsController {
  async addToWallet({ request, response, auth }: HttpContextContract) {
    const { uuid, amount, description } = await request.validate(new WalletModificationValidator())
    const { user, wallet } = await User.getStudentBasicInfo('uuid', uuid)
    await StudentService.addToWallet(user, amount, wallet, `Add money to wallet. ${description || ''}`)
    await Admin.logAction(auth.id, 'add to wallet', 'add_to_wallet', `add amount ${amount} to ${user.username} wallet`)
    return Http.respond(response, `Wallet is updated, new balance: ${wallet.amount} EGP`)
  }

  async deductFromWallet({ request, response, auth }: HttpContextContract) {
    const { uuid, amount, description } = await request.validate(new WalletModificationValidator())
    const { user, wallet } = await User.getStudentBasicInfo('uuid', uuid)
    await StudentService.failIfSufficient(wallet, amount)
    await StudentService.deductFromWallet(user, amount, wallet, `Deduct money from wallet. ${description || ''}`)
    await Admin.logAction(auth.id, 'deduct from wallet', 'deduct_from_wallet', `deduct amount ${amount} from ${user.username} wallet`)
    return Http.respond(response, `Wallet is updated, new balance: ${wallet.amount} EGP`)
  }

  async setWalletAmount({ request, response, auth }: HttpContextContract) {
    const { uuid, amount, description } = await request.validate(new WalletModificationValidator())
    const { user, wallet } = await User.getStudentBasicInfo('uuid', uuid)
    let amountDiff = wallet.amount - amount
    if (amountDiff === 0) throw new CustomException('invalid wallet amount')
    if (amountDiff > 0) {
      await StudentService.deductFromWallet(user, amountDiff, wallet, `Change wallet amount. ${description || ''}`)
    } else {
      await StudentService.addToWallet(user, -amountDiff, wallet, `Change wallet amount. ${description || ''}`)
    }
    await Admin.logAction(auth.id, 'set wallet', 'set_wallet', `set amount ${amount} to user ${user.username} wallet`)
    return Http.respond(response, `Wallet is updated, new balance: ${wallet.amount} EGP`)
  }
}
