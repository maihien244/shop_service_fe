import { UploadService } from "#/module/file-upload/service/upload-service";
import type { AttachDto, AttachMetadata, CreateAttachRequest } from "../dto";
import { AttachService } from "../service/attach-service";

export function useUploadAttach() {
    const uploadService = new UploadService()
    const attachService = new AttachService()

    return {
        async handleUploadAttach(file: File): Promise<AttachDto> {
            try {
                const presignedUrlDto = await uploadService.getPresignedUrl(file.name)
                await uploadService.uploadImage(presignedUrlDto.presignedUrl, file)
                const attachMetadata: AttachMetadata = {
                    fileName: file.name,
                    keyName: presignedUrlDto.keyName,
                    contentType: file.type,
                    sizeOfBytes: file.size
                }

                const request: CreateAttachRequest = {
                    name: file.name,
                    description: file.name,
                    attachMetadata: attachMetadata
                }

                return attachService.createAttach(request)
            } catch (error) {
                console.error('Error uploading file:', error)
                throw error
            }
        }
    }

}