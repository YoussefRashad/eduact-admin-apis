import {rules} from "@ioc:Adonis/Core/Validator";

export interface ITestQuestionPayload {
  test_id: number,
  weight: number,
  content: string,
  type: string,
  feedback: string,
  order: number,
  mcq: Array<any>,
  matching: Array<{ value: string; match: string }> ,
  ordering: Array<any>,
  otherOptions: Array<string>,
  test_question_id: number,
  tags: Array<string|number>
}
