import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'
import CustomException from 'App/Exceptions/CustomException'

export default class StudentService {
  public static async failIfSufficient(wallet: Wallet, price: number): Promise<void> {
    if (wallet.amount < price) throw new CustomException('insufficient wallet amount')
  }

  public static async addToWallet(user: User, amount, wallet, reason: string | null = null) {
    const newAmount = wallet.amount + amount
    // add wallet log
    await user.related('wallet_logs').create({
      old_amount: wallet.amount,
      amount: amount,
      new_amount: newAmount,
      description: reason || '',
    })
    wallet.amount = newAmount
    await wallet.save()
  }

  public static async deductFromWallet(user: User, amount, wallet, reason: string | null = null) {
    const newAmount = wallet.amount - amount
    // add wallet log
    await user.related('wallet_logs').create({
      old_amount: wallet.amount,
      amount: -amount,
      new_amount: newAmount,
      description: reason || '',
    })
    wallet.amount = newAmount
    await wallet.save()
  }
}
