import { Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type FilterProps = {
    filter: Record<string, unknown>;
    onChangeFilter: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
    onClearFilter: () => void;
    children: React.ReactNode;
};

export function FilterComponent({ filter, children }: FilterProps) {
    const [isOpen, setIsOpen] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);
    
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as HTMLElement;
                if (target && typeof target.closest === 'function') {
                    // Tránh đóng pop-up khi click vào các element được render trong Portal (như Select, MultiSelect dropdown, Popover, v.v.)
                    if (
                        target.closest('[data-radix-portal]') ||
                        target.closest('[data-radix-popper-content-wrapper]') ||
                        target.closest('[role="listbox"]') ||
                        target.closest('[data-overlay-container]') ||
                        target.closest('.react-aria-Popover')
                    ) {
                        return;
                    }
                }

                if (containerRef.current && !containerRef.current.contains(target)) {
                    setIsOpen(false);
                }
            };
    
            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [isOpen]);
    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-12 border px-4 py-2.5 text-label-sm font-semibold transition-all shadow-regular-xs ${
                    isOpen 
                        ? 'bg-primary-alpha-10 border-primary-base text-primary-base' 
                        : 'bg-bg-white-0 border-stroke-soft-200 text-text-strong-950 hover:bg-bg-weak-50 dark:bg-bg-weak-50 dark:border-stroke-sub-300 dark:text-static-white dark:hover:bg-bg-surface-800'
                }`}
            >
                <Filter size={18} />
                Bộ lọc
                {Object.keys(filter).length > 0 ? (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-base text-label-2xs text-static-white">
                        !
                    </span>
                ) : null}
            </button>
            {isOpen && children}
        </div>
    )
}