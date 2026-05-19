export type SsoCallbackRequest = {
    state: string
    iss: string
    code: string
    scope: string
    authuser: string
    prompt: string
}

export type AuthTokenDto = {
    accessToken: string
    refreshToken?: string | null
    expiry: number
}

export type RegisterResponseDto = {
    email: string
    fullName: string
}

export type LoginRequestDto = {
    email: string
    password: string
}

export type RegisterRequestDto = {
    email: string
    phoneNumber: string
    address: string
    fullName: string
    password: string
    gender: keyof typeof GenderType | null
}

export const GenderType = {
    MALE: {
        value: 'MALE',
        lable: 'Nam'
    },
    FEMALE: {
        value: 'FEMALE',
        lable: 'Nữ'
    }
}

export type UserDto = {
    id: number
    fullName: string
    gender: keyof typeof GenderType
    address: string
    email: string
    phoneNumber: string
    isActive: number
}
