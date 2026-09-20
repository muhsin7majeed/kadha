import { Button, Group, HStack, Text } from "@chakra-ui/react";
import { LuLayoutGrid, LuList, LuTable2 } from "react-icons/lu";

import type { OwnerMediaView } from "@/features/user-media/user-media.types";

interface MediaLibraryViewSwitcherProps {
  value: OwnerMediaView;
  onChange: (view: OwnerMediaView) => void;
}

const options = [
  { value: "grid", label: "Grid", icon: LuLayoutGrid },
  { value: "list", label: "List", icon: LuList },
  { value: "table", label: "Table", icon: LuTable2 },
] as const;

const MediaLibraryViewSwitcher = ({
  value,
  onChange,
}: MediaLibraryViewSwitcherProps) => (
  <HStack gap="2">
    <Text color="fg.muted" textStyle="compactLabel">
      View
    </Text>
    <Group attached aria-label="Library display mode" role="group">
      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;

        return (
          <Button
            key={option.value}
            aria-label={`${option.label} view`}
            aria-pressed={selected}
            colorPalette={selected ? "brand" : "gray"}
            size="sm"
            variant={selected ? "solid" : "outline"}
            onClick={() => onChange(option.value)}
          >
            <Icon aria-hidden />
            <Text as="span" display={{ base: "none", sm: "inline" }}>
              {option.label}
            </Text>
          </Button>
        );
      })}
    </Group>
  </HStack>
);

export default MediaLibraryViewSwitcher;
