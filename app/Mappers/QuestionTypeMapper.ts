import CustomException from 'App/Exceptions/CustomException'
import TestQuestionService from 'App/Services/TestService/TestQuestionService'
import McqQuestionService from 'App/Services/TestService/QuestionTypes/McqQuestionService'
import FillInTheGapQuestionService from 'App/Services/TestService/QuestionTypes/FillInTheGapQuestionService'
import OrderingQuestionService from 'App/Services/TestService/QuestionTypes/OrderingQuestionService'
import DragAndDropQuestionService from 'App/Services/TestService/QuestionTypes/DragAndDropQuestionService'
import MatchingQuestionService from 'App/Services/TestService/QuestionTypes/MatchingQuestionService';

export default class QuestionTypeMapper {
  constructor() {}

  /**
   *
   * @param type
   */
  public typeMapper(type: string): TestQuestionService {
    const typeMapper = {
      mcq: new McqQuestionService(),
      gap: new FillInTheGapQuestionService(),
      ordering: new OrderingQuestionService(),
      dragAndDrop: new DragAndDropQuestionService(),
      matching: new MatchingQuestionService()
    }
    const questionRequest: TestQuestionService = typeMapper[type]
    if (!questionRequest) {
      throw new CustomException('question type is not supported')
    }
    return questionRequest
  }
}
