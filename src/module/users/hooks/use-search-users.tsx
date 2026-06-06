import type { SelectItemType } from "#/components/base/select/select-shared"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { UserService, type ListUserParams } from "../service/user-serivce"

export type SearchUsersProps = {
    params: keyof ListUserParams
    queryKey: string[],
}

export function useSearchUsers(props: SearchUsersProps) : {
    options : SelectItemType[] | undefined
    input: string | undefined
    setInput: (input: string) => void
} {
    const [userService] = useState(new UserService())
    const [input, setInput] = useState<string>()
    const { params, queryKey } = props
    
    const { data: options } = useQuery({
        queryKey: [...queryKey, input],
        queryFn: () => userService.getListForSelect({
            [params] : input && input.length > 0 ? input : undefined,
            size: input && input.length > 0 ? undefined : 10
        })
        .then(r => r.results.map(c => ({ id: c.id.toString(), label: c.email } as SelectItemType)))
    })

    return {
        options,
        input,
        setInput,
    }
}