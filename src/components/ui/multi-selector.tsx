import { useCallback, useRef, useState } from "react";
import { ChevronDown, SearchLg } from "@untitledui/icons";
import { useFilter } from "react-aria";
import {
    Autocomplete as AriaAutocomplete,
    Button as AriaButton,
    Dialog as AriaDialog,
    DialogTrigger as AriaDialogTrigger,
    Input as AriaInput,
    ListBox as AriaListBox,
    Popover as AriaPopover,
    SearchField as AriaSearchField,
    type Selection,
} from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { SelectItem } from "@/components/base/select/select-item";
import { SelectContext, sizes, type SelectItemType } from "@/components/base/select/select-shared";

export type MultiSelectorprops = {
    handleSelectionChange: (keys: Set<string>) => void;
    items: SelectItemType[] | undefined;
    selectedKeys: Set<string>;
    placeholder: string;
    inputState?: string;
    onInputChange: (input: string) => void;
    onReset: () => void;
    size?: "sm" | "md" | "lg";
};

export function MultiSelector(props: MultiSelectorprops) {
    const { handleSelectionChange, items, selectedKeys, placeholder, inputState, onInputChange, onReset, size = "md" } = props;

    const { contains } = useFilter({ sensitivity: "base" });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const [popoverWidth, setPopoverWidth] = useState("");

    const onResize = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPopoverWidth(rect.width + "px");
    }, []);

    const selectedCount = selectedKeys.size;
    const hasSelection = selectedCount > 0;

    const onSelectionChange = (keys: Selection) => {
        if (keys === "all") {
            handleSelectionChange(new Set(items?.map((item) => item.id.toString()) || []));
        } else {
            handleSelectionChange(keys as Set<string>);
        }
    };

    return (
        <SelectContext.Provider value={{ size }}>
            <div className="flex flex-col gap-1.5 w-full">
                <AriaDialogTrigger>
                    <AriaButton
                        ref={triggerRef}
                        onClick={onResize}
                        className={(state) =>
                            cx(
                                "relative flex w-full cursor-pointer items-center rounded-lg bg-primary shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset",
                                (state.isFocusVisible || state.isPressed) && "ring-2 ring-brand",
                            )
                        }
                    >
                        <span
                            className={cx(
                                "flex w-full items-center truncate text-left",
                                sizes[size].root,
                                "*:data-icon:shrink-0 *:data-icon:text-fg-quaternary",
                            )}
                        >
                            {hasSelection ? (
                                <span className={cx("flex items-center", sizes[size].textContainer)}>
                                    <span className={cx("font-medium text-primary", sizes[size].text)}>
                                        {selectedCount} selected
                                    </span>
                                </span>
                            ) : (
                                <span className={cx("text-placeholder", sizes[size].text)}>{placeholder}</span>
                            )}

                            <ChevronDown
                                aria-hidden="true"
                                className={cx("ml-auto shrink-0 text-fg-quaternary", size === "lg" ? "size-5" : "size-4 stroke-[2.25px]")}
                            />
                        </span>
                    </AriaButton>

                    <AriaPopover
                        placement="bottom"
                        offset={4}
                        containerPadding={0}
                        style={{ width: popoverWidth || undefined }}
                        className={(state) =>
                            cx(
                                "w-(--trigger-width) origin-(--trigger-anchor-point) overflow-hidden rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt outline-hidden will-change-transform",
                                state.isEntering &&
                                    "duration-150 ease-out animate-in fade-in placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                                state.isExiting &&
                                    "duration-100 ease-in animate-out fade-out placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
                            )
                        }
                    >
                        <AriaDialog className="outline-hidden">
                            <AriaAutocomplete filter={contains} inputValue={inputState} onInputChange={onInputChange}>
                                <div className="border-b border-secondary py-0.5">
                                    <AriaSearchField aria-label="Search" value={inputState} onChange={onInputChange} autoFocus>
                                        <div className={cx("flex items-center px-3 py-2 gap-2", size === "sm" ? "*:data-icon:size-4 *:data-icon:stroke-[2.25px]" : "*:data-icon:size-5")}>
                                            <SearchLg data-icon aria-hidden="true" className="shrink-0 text-fg-quaternary" />
                                            <AriaInput
                                                placeholder="Search"
                                                className={cx(
                                                    "w-full appearance-none bg-transparent text-primary caret-alpha-black/90 outline-hidden placeholder:text-placeholder",
                                                    sizes[size].text
                                                )}
                                            />
                                        </div>
                                    </AriaSearchField>
                                </div>

                                <AriaListBox
                                    aria-label="Options"
                                    items={items}
                                    selectionMode="multiple"
                                    selectionBehavior="toggle"
                                    selectedKeys={selectedKeys}
                                    onSelectionChange={onSelectionChange}
                                    className="overflow-y-auto py-1 outline-hidden max-h-76"
                                >
                                    {(item) => (
                                        <SelectItem 
                                            id={item.id.toString()} 
                                            label={item.label} 
                                            selectionIndicator="checkbox" 
                                            selectionIndicatorAlign="left" 
                                        />
                                    )}
                                </AriaListBox>
                            </AriaAutocomplete>

                            <div className="flex items-center justify-between border-t border-secondary p-3">
                                <Button size={size === "sm" ? "xs" : "sm"} color="secondary" onClick={onReset}>
                                    Reset
                                </Button>
                                <Button
                                    size={size === "sm" ? "xs" : "sm"}
                                    color="secondary"
                                    onClick={() => {
                                        const allKeys = new Set(items?.map((item) => item.id.toString()));
                                        handleSelectionChange(allKeys);
                                    }}
                                >
                                    Select all
                                </Button>
                            </div>
                        </AriaDialog>
                    </AriaPopover>
                </AriaDialogTrigger>
            </div>
        </SelectContext.Provider>
    );
}