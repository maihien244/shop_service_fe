import type { NavItemDividerType, NavItemType } from '../application/app-navigation/config'
import { SidebarNavigationSectionDividers } from '../application/app-navigation/sidebar-section-dividers'

export const SidebarNavigation = ({activeUrl, items}: {activeUrl: string, items: (NavItemType | NavItemDividerType)[]}) => {
    return (
        <SidebarNavigationSectionDividers items={items} activeUrl={activeUrl} />
    )
}