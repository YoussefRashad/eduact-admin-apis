import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Permission from '../../app/Models/Permission'

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    // const uniqueKey = 'code'
    // await Permission.updateOrCreateMany(uniqueKey, [
    //   {
    //     name: 'permission seed #1',
    //     code: 's#1',
    //     description: 'description for seeders for #1',
    //     active: true,
    //     group_id: 1,
    //   },
    //   {
    //     name: 'permission seed #2',
    //     code: 's#2',
    //     description: 'description for seeders for #2',
    //     active: true,
    //     group_id: 1,
    //   },
    //   {
    //     name: 'permission seed #4',
    //     code: 's#4',
    //     description: 'description for seeders for #4',
    //     active: true,
    //     group_id: 2,
    //   },
    // ])
  }
}
