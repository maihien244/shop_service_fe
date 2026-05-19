import type { SelectItemType } from "#/components/base/select/select-shared"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { GetListLaptopRequest, LaptopService } from "../service/laptop-service"

export type SearchLaptopProps = {
    param: keyof GetListLaptopRequest
    queryKey: string[],
}

export function useSearchLaptop(props: SearchLaptopProps) : {
    options : SelectItemType[] | undefined
    input: string | undefined
    setInput: (input: string) => void
} {
    const [laptopService] = useState(new LaptopService())
    const [input, setInput] = useState<string>()
    const { param, queryKey } = props
    
    const { data: options } = useQuery({
        queryKey: [...queryKey, param, input],
        queryFn: () => laptopService.getList({
            ...(input && input.length > 0 && { [param]: input }),
            size: 100
        }).then(r => r.results.map(c => ({ id: c.id.toString(), label: c.name } as SelectItemType)))
    })

    return {
        options,
        input,
        setInput,
    }
}