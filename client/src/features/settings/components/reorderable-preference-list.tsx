import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Flex, HStack, IconButton, Portal, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState, type ReactNode } from 'react';
import { LuChevronDown, LuChevronUp, LuGripVertical } from 'react-icons/lu';

interface ReorderableItem {
  id: string;
}

interface SortablePreferenceItemProps<T extends ReorderableItem> {
  disabled: boolean;
  description?: string;
  index: number;
  item: T;
  itemCount: number;
  label: string;
  leading?: ReactNode;
  onMove: (from: number, to: number) => void;
  controls?: ReactNode;
}

const SortablePreferenceItem = <T extends ReorderableItem>({
  controls,
  description,
  disabled,
  index,
  item,
  itemCount,
  label,
  leading,
  onMove,
}: SortablePreferenceItemProps<T>) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  return (
    <Flex
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      css={{ '@media (prefers-reduced-motion: reduce)': { transition: 'none !important' } }}
      align={{ base: 'stretch', sm: 'center' }}
      direction={{ base: 'column', sm: 'row' }}
      gap="3"
      p="3"
      bg={isDragging ? 'brand.subtle' : 'bg'}
      borderWidth="1px"
      borderColor={isDragging ? 'brand.muted' : 'border'}
      rounded="lg"
      shadow={isDragging ? 'md' : undefined}
      zIndex={isDragging ? 1 : undefined}
    >
      <HStack flex="1" minW="0" gap="3">
        <IconButton
          aria-label={`Drag ${label}`}
          variant="ghost"
          colorPalette="gray"
          cursor={disabled ? 'not-allowed' : 'grab'}
          touchAction="none"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <LuGripVertical />
        </IconButton>
        {leading}
        <Box minW="0">
          <Text fontWeight="medium" truncate>
            {label}
          </Text>
          {description ? (
            <Text color="fg.muted" textStyle="compactLabel">
              {description}
            </Text>
          ) : null}
        </Box>
      </HStack>

      <HStack gap="2" flexWrap="wrap">
        {controls}
        <HStack gap="0">
          <IconButton
            aria-label={`Move ${label} up`}
            size="sm"
            variant="ghost"
            colorPalette="gray"
            disabled={disabled || index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            <LuChevronUp />
          </IconButton>
          <IconButton
            aria-label={`Move ${label} down`}
            size="sm"
            variant="ghost"
            colorPalette="gray"
            disabled={disabled || index === itemCount - 1}
            onClick={() => onMove(index, index + 1)}
          >
            <LuChevronDown />
          </IconButton>
        </HStack>
      </HStack>
    </Flex>
  );
};

interface ReorderablePreferenceListProps<T extends ReorderableItem> {
  disabled?: boolean;
  getDescription?: (item: T) => string | undefined;
  getLabel: (item: T) => string;
  items: T[];
  onMove: (from: number, to: number) => void;
  renderControls?: (item: T) => ReactNode;
  renderLeading?: (item: T) => ReactNode;
}

const ReorderablePreferenceList = <T extends ReorderableItem>({
  disabled = false,
  getDescription,
  getLabel,
  items,
  onMove,
  renderControls,
  renderLeading,
}: ReorderablePreferenceListProps<T>) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveItemId(String(active.id));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItemId(null);
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from >= 0 && to >= 0) onMove(from, to);
  };

  const activeItem = items.find((item) => item.id === activeItemId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveItemId(null)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <Stack gap="2">
          {items.map((item, index) => (
            <SortablePreferenceItem
              key={item.id}
              controls={renderControls?.(item)}
              description={getDescription?.(item)}
              disabled={disabled}
              index={index}
              item={item}
              itemCount={items.length}
              label={getLabel(item)}
              leading={renderLeading?.(item)}
              onMove={onMove}
            />
          ))}
        </Stack>
      </SortableContext>
      <Portal>
        <DragOverlay>
          {activeItem ? (
            <HStack p="4" bg="brand.subtle" color="brand.fg" borderWidth="1px" rounded="lg" shadow="lg">
              <LuGripVertical aria-hidden />
              <Text fontWeight="medium">{getLabel(activeItem)}</Text>
            </HStack>
          ) : null}
        </DragOverlay>
      </Portal>
    </DndContext>
  );
};

export default ReorderablePreferenceList;
