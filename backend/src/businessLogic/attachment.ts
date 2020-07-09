import * as uuid from 'uuid'

import { AttachmentAccess } from '../dataLayer/attachmentAccess'
import { addAttachmentUrl } from './todos'

const attachmentAccess = new AttachmentAccess()

export async function uploadAttachment(userId: string, todoId: string): Promise<string> {
  const attachmentId = uuid.v4()
  const attachment = attachmentAccess.getSignedUrl(attachmentId)

  await addAttachmentUrl(userId, todoId, attachment.attachmentUrl)

  return attachment.uploadUrl
}

export async function deleteAttachment(attachmentUrl: string) {

  const split = attachmentUrl.split('/')
  const attachmentId = split[split.length - 1]

  await attachmentAccess.deleteAttachment(attachmentId)
}