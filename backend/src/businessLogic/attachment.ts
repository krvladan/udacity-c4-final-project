import * as uuid from 'uuid'

import { AttachmentAccess } from '../dataLayer/attachmentAccess'
import { addAttachment } from './todos'

const attachmentAccess = new AttachmentAccess()

export async function uploadAttachment(userId: string, todoId: string): Promise<string> {
  const attachmentId = uuid.v4()
  const attachment = attachmentAccess.getSignedUrl(attachmentId)

  await addAttachment(userId, todoId, attachment.attachmentUrl)

  return attachment.uploadUrl
}