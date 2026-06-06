export const GenderType = {
    MALE: {
        label: "Nam",
        value: "MALE"
    },
    FEMALE: {
        label: "Nữ",
        value: "FEMALE"
    }
}

export type UsersDto = {
    id: number
    fullName: string
    email?: string
    gender?: keyof typeof GenderType
    phoneNumber?: string
    address?: string
    isActive: number
    roles?: string[]
}