export type CreateCategoryRequest = {
    name: string
    code: string
    isActive: number
    baseCodeId: number | null
}

export type CategoryResponse = {
    id: number
    name: string
    code: string
    isActive: number
    baseCodeId: number | null
    baseCode: string | null
    baseCodeName: string | null
    createAt: string
    updateAt: string
}