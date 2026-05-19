import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { StoreModelStatus } from '../dto/store-model.dto';
import * as Input from '#/components/ui/input';
import * as Select from '#/components/ui/select';
import { MultiSelect } from '#/components/base/select/multi-select';
import type { Selection } from "react-aria-components";
import { FilterComponent } from '#/components/ui/filter';
import { useQuery } from '@tanstack/react-query';
import { WarehouseService } from '../servcie/warehouse-service';

export type StoreModelFilterParams = {
    nameLaptopCt?: string;
    warehouseIdEq?: number;
    statusIn?: (keyof typeof StoreModelStatus)[];
};

type ListStoreModelFilterProps = {
    filter: StoreModelFilterParams;
    onChangeFilter: React.Dispatch<React.SetStateAction<StoreModelFilterParams>>;
    onClearFilter: () => void;
};

export const ListStoreModelFilter = ({ filter, onChangeFilter, onClearFilter }: ListStoreModelFilterProps) => {
    const [warehouseService] = useState(() => new WarehouseService())
    
    // Fetch all active warehouses for the dropdown selection
    const { data: warehouseData } = useQuery({
        queryKey: ['warehouses-lookup'],
        queryFn: () => warehouseService.getList({ size: 100, isActive: 1 }),
    })

    const handleSelectionChange = (keys: Selection) => {
        if (keys === "all") {
            onChangeFilter(prev => ({ 
                ...prev, 
                statusIn: Object.keys(StoreModelStatus) as (keyof typeof StoreModelStatus)[] 
            }));
        } else {
            onChangeFilter(prev => ({ 
                ...prev, 
                statusIn: Array.from(keys) as (keyof typeof StoreModelStatus)[] 
            }));
        }
    };

    const handleSelectAll = () => {
        onChangeFilter(prev => ({ 
            ...prev, 
            statusIn: Object.keys(StoreModelStatus) as (keyof typeof StoreModelStatus)[] 
        }));
    };

    const handleReset = () => {
        onChangeFilter(prev => ({ ...prev, statusIn: [] }));
    };

    return (
        <FilterComponent
            filter={filter}
            onChangeFilter={onChangeFilter}
            onClearFilter={onClearFilter}
        >
            <div className="absolute right-0 top-full mt-3 w-[380px] z-100 origin-top-left animate-in fade-in zoom-in-95 duration-200">
                <section className="shadow-complex border border-stroke-soft-200 rounded-12 bg-bg-white-0 dark:bg-bg-weak-50 dark:border-stroke-sub-300 w-full overflow-hidden">
                    <div className="border-b border-stroke-soft-200 dark:border-stroke-sub-300 flex w-full items-center justify-between px-6 py-2 bg-bg-weak-25 dark:bg-bg-surface-800">
                        <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">Bộ lọc tìm kiếm</h2>
                        <button
                            onClick={() => {
                                onClearFilter();
                            }}
                            className="flex items-center gap-2 rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-label-xs font-semibold text-text-sub-600 transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                        >
                            <RotateCcw size={14} />
                            Đặt lại
                        </button>
                    </div>
                    
                    <div className="flex flex-col flex-wrap items-start gap-y-6 px-4 py-2 max-h-[70vh] overflow-y-auto">
                        {/* Name Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Tên Laptop
                            </label>
                            <Input.Root size="medium">
                                <Input.Wrapper>
                                    <Input.Icon as={Search} />
                                    <Input.Input
                                        placeholder="Tìm kiếm theo tên laptop..."
                                        value={filter.nameLaptopCt ?? ''}
                                        onChange={(e) => onChangeFilter(prev => ({ ...prev, nameLaptopCt: e.target.value }))}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>

                        {/* Warehouse Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Kho hàng
                            </label>
                            <Select.Root
                                value={filter.warehouseIdEq !== undefined ? filter.warehouseIdEq.toString() : 'all'} 
                                onValueChange={(val) => {
                                    onChangeFilter(prev => ({ 
                                        ...prev, 
                                        warehouseIdEq: val === 'all' ? undefined : Number(val) 
                                    }));
                                }}
                            >
                                <Select.Trigger className="bg-white">
                                    <Select.Value placeholder="Tất cả kho hàng" />
                                </Select.Trigger>
                                <Select.Content className="z-[1000] bg-white">
                                    <Select.Item value="all">Tất cả kho hàng</Select.Item>
                                    {warehouseData?.results.map((warehouse) => (
                                        <Select.Item key={warehouse.id} value={warehouse.id.toString()}>
                                            {warehouse.name}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Trạng thái sản phẩm
                            </label>
                            <MultiSelect
                                size="sm"
                                className="!bg-white"
                                placeholder="Chọn trạng thái"
                                items={Object.values(StoreModelStatus).map((item) => ({ id: item.value, label: item.label }))}
                                selectedKeys={new Set(filter.statusIn || [])}
                                onSelectionChange={handleSelectionChange}
                                supportingText={`${filter.statusIn?.length || 0} đã chọn`}
                                onReset={handleReset}
                                onSelectAll={handleSelectAll}
                            >
                                {(item) => (
                                    <MultiSelect.Item id={item.id} textValue={item.label} selectionIndicator="checkbox" selectionIndicatorAlign="left">
                                        {item.label}
                                    </MultiSelect.Item>
                                )}
                            </MultiSelect>
                        </div>
                    </div>
                </section>
            </div>
        </FilterComponent>
    );
};
