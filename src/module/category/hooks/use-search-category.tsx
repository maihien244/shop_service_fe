import type { SelectItemType } from "#/components/base/select/select-shared"
import { useQuery } from "@tanstack/react-query"
import { CategoryService } from "../service/category-service"
import { useState } from "react"
import { PublicCategoryService } from "../service/public-category-service"

export type SearchCategoryProps = {
    param: string,
    baseCode: string,
    queryKey: string[],
    isPublic?: boolean
}

export function useSearchCategory(props: SearchCategoryProps): {
    options: SelectItemType[] | undefined
    input: string | undefined
    setInput: (input: string) => void
} {
    const [categoryService] = useState(() => props.isPublic ? new PublicCategoryService() : new CategoryService())
    const [input, setInput] = useState<string>()
    const { param, baseCode, queryKey } = props



    const { data: options } = useQuery({
        queryKey: [...queryKey, param, input],
        queryFn: () => categoryService.getList({
            'baseCode:eq': baseCode,
            'name:ct': input && input.length > 0 ? input : undefined,
            size: 100
        }).then(r => r.results.map(c => ({ id: c.id.toString(), label: c.name } as SelectItemType)))
    })

    return {
        options,
        input,
        setInput,
    }
}