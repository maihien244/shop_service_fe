import { FilterComponent } from "#/components/ui/filter";
import * as Input from "#/components/ui/input";
import * as Select from "#/components/ui/select";
import { RotateCcw, Search } from "lucide-react";

export type CategoryFilterParams = {
    'name:ct'?: string;
    'code:eq'?: string;
    'baseCategoryName:ct'?: string;
    isActive?: number;
};

export type ListCategoryFilterProps = {
    filter: CategoryFilterParams;
    onChangeFilter: React.Dispatch<React.SetStateAction<CategoryFilterParams>>;
    onClearFilter: () => void;
};

export function ListCategoryFilter({ filter, onChangeFilter, onClearFilter }: ListCategoryFilterProps) {
    console.log("filter", filter)
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
                            onClick={onClearFilter}
                            className="flex items-center gap-2 rounded-10 border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 text-label-xs font-semibold text-text-sub-600 transition-all hover:bg-bg-weak-50 active:scale-95 dark:border-stroke-sub-300 dark:bg-bg-weak-50 dark:text-text-soft-400"
                        >
                            <RotateCcw size={14} />
                            Đặt lại
                        </button>
                    </div>
                    
                    <div className="flex flex-col items-start gap-y-6 px-4 py-4 max-h-[60vh] overflow-y-auto">
                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Tên danh mục
                            </label>
                            <Input.Root size="medium">
                                <Input.Wrapper>
                                    <Input.Icon as={Search} />
                                    <Input.Input 
                                        placeholder="Tìm kiếm theo tên..." 
                                        value={filter['name:ct'] || ''}
                                        onChange={(e) => onChangeFilter(prev => ({ ...prev, 'name:ct': e.target.value }))}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>

                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Mã danh mục
                            </label>
                            <Input.Root size="medium">
                                <Input.Wrapper>
                                    <Input.Input 
                                        placeholder="Mã danh mục..." 
                                        value={filter['code:eq'] || ''}
                                        onChange={(e) => onChangeFilter(prev => ({ ...prev, 'code:eq': e.target.value }))}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>

                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Danh mục cha
                            </label>
                            <Input.Root size="medium">
                                <Input.Wrapper>
                                    <Input.Input 
                                        placeholder="Danh mục cha..." 
                                        value={filter['baseCategoryName:ct'] || ''}
                                        onChange={(e) => onChangeFilter(prev => ({ ...prev, 'baseCategoryName:ct': e.target.value }))}
                                    />
                                </Input.Wrapper>
                            </Input.Root>
                        </div>

                        <div className="w-full">
                            <label className="text-label-xs font-semibold text-text-sub-600 dark:text-text-soft-400 mb-2.5 block">
                                Trạng thái
                            </label>
                            <Select.Root 
                                value={filter.isActive !== undefined ? filter.isActive.toString() : 'undefined'}
                                onValueChange={(val) => onChangeFilter(prev => ({ ...prev, isActive: val === 'undefined' ? undefined : Number(val) }))}
                            >
                                <Select.Trigger>
                                    <Select.Value placeholder="Tất cả trạng thái" />
                                </Select.Trigger>
                                <Select.Content>
                                    <Select.Item value="undefined">Tất cả trạng thái</Select.Item>
                                    <Select.Item value="1">Hoạt động</Select.Item>
                                    <Select.Item value="0">Không hoạt động</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </div>
                    </div>
                </section>
            </div>
        </FilterComponent>
    )
}