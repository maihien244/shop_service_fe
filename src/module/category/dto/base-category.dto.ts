export type CreateBaseCategoryRequest = {
    name: string
    code: string
    isActive: number
}

export type BaseCategoryResponse = {
    id: number
    name: string
    code: string
    isActive: number
    createAt: string
    updateAt: string
}