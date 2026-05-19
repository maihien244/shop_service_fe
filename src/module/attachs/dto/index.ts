export type AttachMetadata = {
    fileName: string
    keyName: string
    contentType: string
    sizeOfBytes: number
}

export enum AttachType {
    LAP_TOP = 1,
    USER = 2,
    COMMENT = 3,
    COMPLAINT = 4,
    POST = 5
}

export type CreateAttachRequest = {
    name: string
    description?: string
    attachMetadata: AttachMetadata
}

export interface AttachDto {
    id: number
    name: string
    description: string
    isActive: boolean
    type: AttachType
    moduleId: number
    ownerId: number
    attachMetadata: AttachMetadata
    updateAt: string | number | Date
    createAt: string | number | Date
}