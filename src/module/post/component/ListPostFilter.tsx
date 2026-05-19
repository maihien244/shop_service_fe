import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, CheckSquare, Square, Filter } from 'lucide-react';
import { PostStatus } from '../dto';
import * as Input from '#/components/ui/input';
import { MultiSelect } from '#/components/base/select/multi-select';
import type { Selection } from "react-aria-components";
import { FilterComponent } from '#/components/ui/filter';

export type PostFilterParams = {
    titleCt?: string;
    createAtGe?: string;
    createAtLe?: string;
    statusIn?: string[];
};

type ListPostFilterProps = {
    filter: PostFilterParams;
    onChangeFilter: React.Dispatch<React.SetStateAction<PostFilterParams>>;
    onClearFilter: () => void;
};

export const ListPostFilter = ({ filter, onChangeFilter, onClearFilter }: ListPostFilterProps) => {
    const handleSelectionChange = (keys: Selection) => {
        if (keys === "all") {
            onChangeFilter(prev => ({ ...prev, statusIn: Object.values(PostStatus).map(s => s.value) }));
        } else {
            onChangeFilter(prev => ({ ...prev, statusIn: Array.from(keys) as string[] }));
        }
    };

    const handleSelectAll = () => {
        onChangeFilter(prev => ({ ...prev, statusIn: Object.values(PostStatus).map(s => s.value) }));
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
                        {/* Title Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Tên bài viết
                            </label>
                            <Input.Root size="medium">
                                <Input.Wrapper>
                                    <Input.Icon as={Search} />
                                    <Input.Input
                                        placeholder="Tìm kiếm theo tên..."
                                        value={filter.titleCt ?? ''}
                                        onChange={(e) => onChangeFilter(prev => ({ ...prev, titleCt: e.target.value }))}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Trạng thái
                            </label>
                            <MultiSelect
                                size="sm"
                                className="bg-white"
                                placeholder="Chọn trạng thái"
                                items={Object.values(PostStatus).map((item) => ({ id: item.value, label: item.label }))}
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

                        {/* Date Range Filter */}
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Ngày tạo
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-label-2xs text-text-soft-400 block mb-1">Từ ngày</label>
                                    <Input.Root size="medium">
                                        <Input.Wrapper className="px-2">
                                            <Input.Input
                                                type="date"
                                                className="text-label-sm"
                                                value={filter.createAtGe ? filter.createAtGe.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    onChangeFilter(prev => ({ ...prev, createAtGe: val ? `${val}T00:00:00` : undefined }));
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
                                                value={filter.createAtLe ? filter.createAtLe.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    onChangeFilter(prev => ({ ...prev, createAtLe: val ? `${val}T23:59:59` : undefined }));
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
