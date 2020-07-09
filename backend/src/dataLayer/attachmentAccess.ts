import * as AWS from 'aws-sdk'

import { createLogger } from "../utils/logger"
import { Logger } from 'winston'

export interface AttachmentItem {
  uploadUrl: string
  attachmentUrl: string
}

export class AttachmentAccess {
  constructor(
    private readonly s3 = new AWS.S3({signatureVersion: 'v4'}),
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly logger : Logger = createLogger('AttachmentAccess')
  ) {}

  getSignedUrl(attachmentId: string): AttachmentItem {
    this.logger.info('Get signed url', {attachmentId})

    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: attachmentId,
      Expires: this.urlExpiration
    })

    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`

    this.logger.info('Generated', {uploadUrl, attachmentUrl})

    return { 
      uploadUrl,
      attachmentUrl
    }
  }
}