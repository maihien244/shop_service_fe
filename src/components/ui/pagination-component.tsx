import {
  RiArrowLeftDoubleLine,
  RiArrowLeftSLine,
  RiArrowRightDoubleLine,
  RiArrowRightSLine,
} from '@remixicon/react';

import * as Pagination from "./pagination";
import type { Table } from '@tanstack/react-table';
import { useEffect, useState } from 'react';


export function PaginationComponent({table} : {table: Table<any>}) {
    const [pageOptions, setPageOptions] = useState<number[]>([]);
    const STEP = 3;

    useEffect(() => {
        let pageOptions : number[] = table.getPageOptions()
        .map((page) => {
            const leftStep = Math.max(0, table.getState().pagination.pageIndex - STEP);
            const rightStep = Math.min(table.getPageCount() - 1, table.getState().pagination.pageIndex + STEP);
            console.log('table.getPageOptions()', table.getPageCount(), table.getState().pagination.pageIndex)
            
            if (page >= leftStep && page <= rightStep) {
                return page
            }
        }).filter((page) => page != undefined);
        if (pageOptions.length === 0 ) pageOptions = [1]
        setPageOptions(pageOptions)
    }, [table.getPageOptions(), table.getPageCount(), table.getState().pagination.pageIndex])

    return (
        <Pagination.Root>
            <Pagination.NavButton onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                <Pagination.NavIcon as={RiArrowLeftDoubleLine} />
            </Pagination.NavButton>
            <Pagination.NavButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <Pagination.NavIcon as={RiArrowLeftSLine} />
            </Pagination.NavButton>
            {pageOptions.map((page) => (
                <Pagination.Item 
                key={page} 
                current={table.getState().pagination.pageIndex === page} 
                onClick={() => table.setPageIndex(page as number)}>
                    {page as number + 1}
                </Pagination.Item>
            ))}
            <Pagination.NavButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <Pagination.NavIcon as={RiArrowRightSLine} />
            </Pagination.NavButton>
            <Pagination.NavButton onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                <Pagination.NavIcon as={RiArrowRightDoubleLine} />
            </Pagination.NavButton>
        </Pagination.Root>
    )
}
    