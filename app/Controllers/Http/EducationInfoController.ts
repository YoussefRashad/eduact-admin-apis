import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Http from 'App/Utils/Http'
import EducationType from 'App/Models/EducationType'

export default class EducationInfoController {
  public async educationInfoDropdown({ response }: HttpContextContract) {
    const educationInfo = await EducationType.query()
      .preload('educationLanguages')
      .preload('educationYears', (query) => {
        query.preload('educationSections')
      })
    return Http.respond(response, 'education info', educationInfo)
  }
}
