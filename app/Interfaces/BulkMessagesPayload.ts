export interface BulkMessagesPayload {
  to: Array<string>
  subject: string | undefined
  body: string
}
