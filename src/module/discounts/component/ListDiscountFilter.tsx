import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { DiscountType } from '../dto';
import * as Input from '#/components/ui/input';
import * as Select from '#/components/ui/select';
import { FilterComponent } from '#/components/ui/filter';

export type DiscountFilterParams = {
    nameCt?: string;
    codeEq?: string;
    typeEq?: string;
    isActive?: string;
    expiredAtGe?: string;
    expiredAtLe?: string;
};

type ListDiscountFilterProps = {
    filter: DiscountFilterParams;
    onChangeFilter: React.Dispatch<React.SetStateAction<DiscountFilterParams>>;
    onClearFilter: () => void;
};

export const ListDiscountFilter = ({ filter, onChangeFilter, onClearFilter }: ListDiscountFilterProps) => {

    return (
        <FilterComponent
            filter={filter}
            onChangeFilter={onChangeFilter}
            onClearFilter={onClearFilter}
        >
            <div className="absolute right-0 top-full mt-3 w-[380px] z-[100] origin-top-left animate-in fade-in zoom-in-95 duration-200">
                <section className="shadow-complex border border-stroke-soft-200 rounded-12 bg-bg-white-0 dark:bg-bg-weak-50 dark:border-stroke-sub-300 w-full overflow-hidden">
                    <div className="border-b border-stroke-soft-200 dark:border-stroke-sub-300 flex w-full items-center justify-between px-6 py-2 bg-bg-weak-25 dark:bg-bg-surface-800">
                        <h2 className="text-label-md font-bold text-text-strong-950 dark:text-static-white">Bộ lọc tìm kiếm</h2>
                        <button
                            onClick={onClearFilter}
                            className="flex items-center gap-2 rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-label-xs font-semibold text-text-sub-600 transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                        >
                            <RotateCcw size={14} />
                            Đặt lại
                        </button>
                    </div>
                    
                    <div className="flex flex-col flex-wrap items-start gap-y-6 px-4 py-4 max-h-[70vh] overflow-y-auto">
                        {/* Name Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Tên khuyến mãi
                            </label>
                            <Input.Root size="medium">
                                <Input.Wrapper>
                                    <Input.Icon as={Search} />
                                    <Input.Input
                                        placeholder="Tìm kiếm theo tên..."
                                        value={filter.nameCt ?? ''}
                                        onChange={(e) => onChangeFilter(prev => ({ ...prev, nameCt: e.target.value }))}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>

                        {/* Code Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Mã Code
                            </label>
                            <Input.Root size="medium">
                                <Input.Wrapper>
                                    <Input.Icon as={Search} />
                                    <Input.Input
                                        placeholder="Tìm kiếm theo mã code..."
                                        value={filter.codeEq ?? ''}
                                        onChange={(e) => onChangeFilter(prev => ({ ...prev, codeEq: e.target.value }))}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>

                        {/* Type Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Loại khuyến mãi
                            </label>
                            <div className="relative group">
                                <Select.Root 
                                    value={filter.typeEq ?? ''} 
                                    onValueChange={(value) => onChangeFilter(prev => ({ ...prev, typeEq: value === 'all' ? undefined : value }))}
                                >
                                    <Select.Trigger>
                                        <Select.Value placeholder='Tất cả' />
                                    </Select.Trigger>
                                    <Select.Content>
                                        <Select.Item value="all">Tất cả</Select.Item>
                                        {Object.values(DiscountType).map((item, index) => (
                                        <Select.Item key={index} value={item.value}>
                                            {item.label}
                                        </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Root>
                            </div>
                        </div>

                        {/* Active Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Trạng thái
                            </label>
                            <div className="relative group">
                                <Select.Root 
                                    value={filter.isActive ?? ''} 
                                    onValueChange={(value) => onChangeFilter(prev => ({ ...prev, isActive: value === 'all' ? undefined : value }))}
                                >
                                    <Select.Trigger>
                                        <Select.Value placeholder='Tất cả' />
                                    </Select.Trigger>
                                    <Select.Content>
                                        <Select.Item value="all">Tất cả</Select.Item>
                                        <Select.Item value="true">Hoạt động</Select.Item>
                                        <Select.Item value="false">Đã khóa</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            </div>
                        </div>

                        {/* Date Range Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Ngày hết hạn
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-label-2xs text-text-soft-400 block mb-1">Từ ngày</label>
                                    <Input.Root size="medium">
                                        <Input.Wrapper className="px-2">
                                            <Input.Input
                                                type="date"
                                                className="text-label-sm"
                                                value={filter.expiredAtGe ? filter.expiredAtGe.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    onChangeFilter(prev => ({ ...prev, expiredAtGe: val ? `${val}T00:00:00` : undefined }));
                                                }}
                                            />
                                        </Input.Wrapper>
                                    </Input.Root>
                                </div>
                                <div>
                                    <label className="text-label-2xs text-text-soft-400 block mb-1">Đến ngày</label>
                                    <Input.Root size="medium">
                                        <Input.Wrapper className="px-2">
                                            <Input.Input
                                                type="date"
                                                className="text-label-sm"
                                                value={filter.expiredAtLe ? filter.expiredAtLe.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    onChangeFilter(prev => ({ ...prev, expiredAtLe: val ? `${val}T23:59:59` : undefined }));
                                                }}
                                            />
                                        </Input.Wrapper>
                                    </Input.Root>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </FilterComponent>
    );
};
