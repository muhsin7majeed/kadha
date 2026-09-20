import { Box, Tabs } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";
import { ReactNode } from "react";
import NavLink from "./nav-link";

export interface TabItem<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
}

interface SimpleTabsProps extends Omit<
  Tabs.RootProps,
  "children" | "defaultValue" | "value" | "onValueChange"
> {
  tabs: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
  listProps?: BoxProps;
  triggerType?: "link";
}

const SimpleTabs: React.FC<SimpleTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  children,
  listProps,
  triggerType,
  colorPalette = "brand",
  ...rootProps
}) => {
  const handleValueChange = (details: { value: string }) => {
    onValueChange?.(details.value);
  };

  return (
    <Tabs.Root
      {...rootProps}
      colorPalette={colorPalette}
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={handleValueChange}
    >
      <Box overflowX="auto" {...listProps}>
        <Tabs.List minW="fit-content" whiteSpace="nowrap">
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              as={triggerType === "link" ? NavLink : undefined}
              outline={triggerType === "link" ? "none" : undefined}
              textStyle="compactLabel"
            >
              {tab.icon}
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Box>

      {children ??
        tabs.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value}>
            {tab.content}
          </Tabs.Content>
        ))}
    </Tabs.Root>
  );
};

export default SimpleTabs;
