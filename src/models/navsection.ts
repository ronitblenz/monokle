import React from 'react';

export type NavSectionItemCustomComponentProps<ItemType> = {
  item: ItemType;
  isItemHovered: boolean;
  isItemSelected: boolean;
  isItemDisabled: boolean;
};

export type NavSectionItemCustomComponent<ItemType> = React.ComponentType<NavSectionItemCustomComponentProps<ItemType>>;

export interface NavSectionItemCustomization<ItemType> {
  Prefix?: NavSectionItemCustomComponent<ItemType>;
  Suffix?: NavSectionItemCustomComponent<ItemType>;
  QuickAction?: NavSectionItemCustomComponent<ItemType>;
  ContextMenu?: NavSectionItemCustomComponent<ItemType>;
}

export interface NavSectionItemHandler<ItemType, ScopeType> {
  getName: (item: ItemType) => string;
  getIdentifier: (item: ItemType) => string;
  isSelected?: (item: ItemType, scope: ScopeType) => boolean;
  isHighlighted?: (item: ItemType, scope: ScopeType) => boolean;
  isVisible?: (item: ItemType, scope: ScopeType) => boolean;
  isDirty?: (item: ItemType, scope: ScopeType) => boolean;
  isDisabled?: (item: ItemType, scope: ScopeType) => boolean;
  shouldScrollIntoView?: (item: ItemType, scope: ScopeType) => boolean;
  onClick?: (item: ItemType, scope: ScopeType) => void;
}

interface NavSectionItemGroup<ItemType> {
  groupId: string;
  groupName: string;
  groupItems: ItemType[];
}

export interface NavSection<ItemType, ScopeType = any> {
  name: string;
  useScope: () => ScopeType;
  subsectionNames?: string[];
  getItems?: (scope: ScopeType) => ItemType[];
  getGroups?: (scope: ScopeType) => NavSectionItemGroup<ItemType>[];
  isLoading?: (scope: ScopeType, items: ItemType[]) => boolean;
  isVisible?: (scope: ScopeType, items: ItemType[]) => boolean;
  isInitialized?: (scope: ScopeType, items: ItemType[]) => boolean;
  itemHandler?: NavSectionItemHandler<ItemType, ScopeType>;
  itemCustomization?: NavSectionItemCustomization<ItemType>;
}

export interface NavSectionItemInstance {
  name: string;
  identifier: string;
  isSelected: boolean;
  isHighlighted: boolean;
  isVisible: boolean;
  isDirty: boolean;
  isDisabled: boolean;
  shouldScrollIntoView: boolean;
}

export interface NavSectionItemGroupInstance {
  groupId: string;
  groupName: string;
  groupItems: NavSectionItemInstance[];
}

export interface NavSectionInstance {
  name: string;
  subsectionNames?: string[];
  items: NavSectionItemInstance[];
  groups: NavSectionItemGroupInstance[];
  isLoading: boolean;
  isVisible: boolean;
}
