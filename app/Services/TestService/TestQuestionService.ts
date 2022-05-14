import ResourceNotFoundException from 'App/Exceptions/ResourceNotFoundException'
import ForbiddenException from 'App/Exceptions/ForbiddenException'
import TestQuestion from '../../Models/TestQuestion'
import ControllersUtils from 'App/Controllers/Http/ControllersUtils'
import DataFilter from 'App/Utils/Filters'
import Tag from 'App/Models/Tag'

export default class TestQuestionService {
  constructor() {}

  /**
   *
   * @param testQuestion
   * @returns
   */
  public async createTestQuestion(testQuestion: Partial<TestQuestion>) {
    return TestQuestion.create(testQuestion)
  }

  /**
   *
   * @param id
   * @param question
   * @returns
   */
  public async updateTestQuestion(id: number, question: Partial<TestQuestion>) {
    const testQuestion = await this.getTestQuestionByIdOrFail(id)
    await testQuestion.merge(question).save()
    return testQuestion
  }

  /**
   * Fetch test questions with its types and tags
   * @param queryParams
   * @returns
   */
  public async fetchTestQuestions(queryParams: any) {
    let { page, perPage, from, to, filters, sortBy, query } = queryParams
    const searchColumns = ['weight', 'type', 'order']
    let filterByTagsName: string | null = null
    let newFilters: Object[] = []
    filters?.map((filter) => {
      if (filter['tags.name']) {
        filterByTagsName = filter['tags.name']
        return
      }
      if (filter.test_id) {
        newFilters.push(filter)
        return
      }
    })

    const testQuestionQuery = TestQuestion.query()
    if (filterByTagsName) {
      testQuestionQuery.whereHas('testQuestionTags', (tagQuery) => {
        if (filterByTagsName) tagQuery.where('name', filterByTagsName)
      })
    }
    ControllersUtils.applyAllQueryUtils(testQuestionQuery, from, to, newFilters, sortBy, searchColumns, query, 'test_questions')

    return testQuestionQuery
      .preload('multipleChoiceQuestions')
      .preload('fillInTheGapQuestions')
      .preload('orderingQuestions')
      .preload('dragAndDropOptions')
      .preload('testQuestionTags')
      .preload('matchingOptions')
      .paginate(page, perPage)
  }

  /**
   * get filters of test questions
   * @returns
   */
  public async fetchTestQuestionsFilters() {
    const testQuestion = new DataFilter({
      model: TestQuestion,
      filterObjects: [
        {
          name: 'test_id',
          value: 'test_id',
          optionNameColumn: 'test_id',
          optionValueColumn: 'test_id',
        },
      ],
    }).process()

    const tags = new DataFilter({
      model: Tag,
      filterObjects: [
        {
          name: 'Tag',
          value: 'tags.name',
          optionNameColumn: 'name',
          optionValueColumn: 'name',
        },
      ],
    }).process()
    const filters = await Promise.all([tags, testQuestion])
    return [...filters[0], ...filters[1]]
  }

  /**
   * get test questions with its types and tags
   * @param id
   * @returns
   */
  public async getTestQuestionWithDependenciesByIdOrFail(id: number) {
    const testQuestion = await TestQuestion.query()
      .where('id', id)
      .preload('testQuestionTags')
      .preload('multipleChoiceQuestions')
      .preload('fillInTheGapQuestions')
      .preload('orderingQuestions')
      .preload('dragAndDropOptions')
      .preload('matchingOptions')
      .first()
    if (!testQuestion) {
      throw new ResourceNotFoundException('test question does not exist')
    }
    return testQuestion
  }

  /**
   * get test questions
   * @param id
   * @returns
   */
  public async getTestQuestionByIdOrFail(id: number) {
    const testQuestion = await TestQuestion.query().where('id', id).first()
    if (!testQuestion) {
      throw new ResourceNotFoundException('test question does not exist')
    }
    return testQuestion
  }

  /**
   *
   * @param id
   * @returns
   */
  public async deleteTestQuestionByIdOrFail(id: number) {
    const testQuestion = await TestQuestion.query().where('id', id).preload('test').first()
    if (!testQuestion) {
      throw new ResourceNotFoundException('test question does not exist')
    }
    if (testQuestion.test.active) {
      throw new ForbiddenException('test is in active mode')
    }
    await testQuestion.delete()
    return testQuestion
  }

  /**
   *
   * @param testQuestion
   * @param tagsIds
   */
  public async attachTags(testQuestion: TestQuestion, tagsIds: Array<string | number> | undefined): Promise<void> {
    if (!tagsIds) return
    await testQuestion.related('testQuestionTags').sync(tagsIds)
  }
}
