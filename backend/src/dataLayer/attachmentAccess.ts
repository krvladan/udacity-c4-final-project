import * as AWS from 'aws-sdk'
import * as AWSXray from 'aws-xray-sdk'

const XAWS = AWSXray.captureAWS(AWS)

export interface AttachmentItem {
  uploadUrl: string
  attachmentUrl: string
}

export class AttachmentAccess {
  constructor(
    private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  getSignedUrl(attachmentId: string): AttachmentItem {
    console.log('getSignedUrl', {attachmentId})

    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: attachmentId,
      Expires: this.urlExpiration
    })

    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`

    console.log('getSignedUrl result', {uploadUrl, attachmentUrl})

    return { 
      uploadUrl,
      attachmentUrl
    }
  }

  async deleteAttachment(attachmentId: string) {
    console.log('deleteAttachment', {attachmentId})

    const result = await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: attachmentId
    }).promise()

    console.log('deleteAttachment result', result)
  }
}