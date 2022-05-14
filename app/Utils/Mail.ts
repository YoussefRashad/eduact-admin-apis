import aws from 'aws-sdk'
import Env from '@ioc:Adonis/Core/Env'

export class Mail {
  static async sendEmail(email, subject, content) {
    aws.config.update({
      accessKeyId: Env.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: Env.get('AWS_SECRET_ACCESS_KEY'),
      region: Env.get('AWS_REGION'),
    })

    // Create sendEmail params
    var params = {
      Destination: {
        /* required */
        ToAddresses: [
          email,
          // email
          /* more items */
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: 'UTF-8',
            Data: content,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: 'no-reply@eduact.me',
      /* required */
      ReplyToAddresses: [
        'no-reply@eduact.me',
        /* more items */
      ],
    }

    // Create the promise and SES service object
    var sendPromise = new aws.SES({
      apiVersion: '2010-12-01',
    })
      .sendEmail(params)
      .promise()

    // return sendPromise;

    return sendPromise
    // Handle promise's fulfilled/rejected states
    // return sendPromise
    //   .then(function (data) {
    //     console.log('Mailer: ', data)
    //     return data
    //   })
    //   .catch(function (err) {
    //     console.log('Mailer: ', err)
    //     return err
    //   })
  }
}
