export type CreatePostRequestDto = {
    title: string,
    description: string,
    status: keyof typeof PostStatus,
    attachIds: number[],
    slug: string,
}

export const PostStatus = {
    DELETED: {
        value: "DELETED",
        label: "Xóa"
    },
    DRAFT: {
        value: "DRAFT",
        label: "Nháp"
    },
    ACTIVE: {
        value: "ACTIVE",
        label: "Hoạt động"
    }
}

export type PostDto = {
    id: number,
    title: string,
    description: string,
    status: keyof typeof PostStatus,
    createAt: string,
    updateAt: string,
}

export type UpdatePostRequestDto = {
    title: string,
    description: string,
    status: keyof typeof PostStatus,
    attachIds: number[]
    slug: string,
}
