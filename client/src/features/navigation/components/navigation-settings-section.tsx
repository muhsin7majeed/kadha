import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Heading,
  HStack,
  IconButton,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { LuChevronDown, LuChevronUp, LuGripVertical, LuRotateCcw } from 'react-icons/lu';

import useNavigationPreferences from '@/features/navigation/api/use-navigation-preferences';
import useUpdateNavigationPreferences from '@/features/navigation/api/use-update-navigation-preferences';
import { NavigationSurface } from '@/features/navigation/components/navigation-surface';
import { DEFAULT_NAVIGATION_PREFERENCES } from '@/features/navigation/navigation-defaults';
import { NAVIGATION_BY_ID } from '@/features/navigation/navigation-registry';
import type {
  NavigationItemDisplay,
  NavigationLayout,
  NavigationPreferenceItem,
  NavigationPreferences,
} from '@/features/navigation/navigation.types';

interface SortableDestinationProps {
  compactFull: boolean;
  index: number;
  item: NavigationPreferenceItem;
  itemCount: number;
  onDisplayChange: (id: NavigationPreferenceItem['id'], display: NavigationItemDisplay) => void;
  onMove: (from: number, to: number) => void;
  onVisibilityChange: (id: NavigationPreferenceItem['id'], visible: boolean) => void;
}

const SortableDestination = ({
  compactFull,
  index,
  item,
  itemCount,
  onDisplayChange,
  onMove,
  onVisibilityChange,
}: SortableDestinationProps) => {
  const destination = NAVIGATION_BY_ID.get(item.id);
  const mandatory = item.id === 'home' || item.id === 'menu';
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  if (!destination) return null;
  const DestinationIcon = destination.icon;

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
          aria-label={`Drag ${destination.label}`}
          variant="ghost"
          colorPalette="gray"
          cursor="grab"
          touchAction="none"
          {...attributes}
          {...listeners}
        >
          <LuGripVertical />
        </IconButton>
        <DestinationIcon aria-hidden />
        <Box minW="0">
          <Text fontWeight="medium" truncate>
            {destination.label}
          </Text>
          {mandatory ? (
            <Text color="fg.muted" textStyle="compactLabel">
              Always available
            </Text>
          ) : null}
        </Box>
      </HStack>

      <HStack gap="2" flexWrap="wrap">
        <HStack as="label" gap="2" cursor={mandatory || (!item.visible && compactFull) ? 'not-allowed' : 'pointer'}>
          <input
            type="checkbox"
            aria-label={`Show ${destination.label} in navigation`}
            checked={item.visible}
            disabled={mandatory || (!item.visible && compactFull)}
            onChange={(event) => onVisibilityChange(item.id, event.currentTarget.checked)}
          />
          <Text textStyle="supporting">Show</Text>
        </HStack>

        <NativeSelect.Root size="sm" w="32">
          <NativeSelect.Field
            aria-label={`${destination.label} appearance`}
            value={item.display}
            onChange={(event) => onDisplayChange(item.id, event.currentTarget.value as NavigationItemDisplay)}
          >
            <option value="both">Icon + label</option>
            <option value="icon">Icon only</option>
            <option value="label">Label only</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <HStack gap="0">
          <IconButton
            aria-label={`Move ${destination.label} up`}
            size="sm"
            variant="ghost"
            colorPalette="gray"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
          >
            <LuChevronUp />
          </IconButton>
          <IconButton
            aria-label={`Move ${destination.label} down`}
            size="sm"
            variant="ghost"
            colorPalette="gray"
            disabled={index === itemCount - 1}
            onClick={() => onMove(index, index + 1)}
          >
            <LuChevronDown />
          </IconButton>
        </HStack>
      </HStack>
    </Flex>
  );
};

const fitCompactCapacity = (items: NavigationPreferenceItem[]) => {
  let optionalSlots = 4;
  return items.map((item) => {
    if (item.id === 'home' || item.id === 'menu' || !item.visible) return item;
    const visible = optionalSlots > 0;
    optionalSlots -= 1;
    return visible ? item : { ...item, visible: false };
  });
};

const NavigationSettingsSection = () => {
  const { data, isLoading } = useNavigationPreferences();
  const { mutateAsync: updatePreferences, isPending } = useUpdateNavigationPreferences();
  const [preferences, setPreferences] = useState<NavigationPreferences>(() =>
    structuredClone(DEFAULT_NAVIGATION_PREFERENCES),
  );
  const [activeItemId, setActiveItemId] = useState<NavigationPreferenceItem['id'] | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (data) setPreferences(structuredClone(data));
  }, [data]);

  const savedPreferences = data ?? DEFAULT_NAVIGATION_PREFERENCES;
  const isDirty = JSON.stringify(preferences) !== JSON.stringify(savedPreferences);
  const compactFull = preferences.layout === 'compact' && preferences.items.filter((item) => item.visible).length >= 6;

  const itemIds = useMemo(() => preferences.items.map((item) => item.id), [preferences.items]);

  const updateItems = (updater: (items: NavigationPreferenceItem[]) => NavigationPreferenceItem[]) => {
    setPreferences((current) => ({ ...current, items: updater(current.items) }));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= preferences.items.length) return;
    updateItems((items) => arrayMove(items, from, to));
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveItemId(active.id as NavigationPreferenceItem['id']);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveItemId(null);
    if (!over || active.id === over.id) return;
    const from = preferences.items.findIndex((item) => item.id === active.id);
    const to = preferences.items.findIndex((item) => item.id === over.id);
    moveItem(from, to);
  };

  const handleLayoutChange = (layout: NavigationLayout) => {
    setPreferences((current) => ({
      ...current,
      layout,
      items: layout === 'compact' ? fitCompactCapacity(current.items) : current.items,
    }));
  };

  const handleSave = async () => {
    const saved = await updatePreferences(preferences);
    setPreferences(structuredClone(saved));
  };

  return (
    <Stack gap="5">
      <Card.Root variant="outline">
        <Card.Header>
          <Heading as="h3" textStyle="subsectionTitle">
            Tab bar layout
          </Heading>
          <Text color="fg.muted" textStyle="supporting">
            Choose a compact bar, a freely scrolling bar, or an app-style grid launcher.
          </Text>
        </Card.Header>
        <Card.Body pt="0">
          <Stack gap="5">
            <Field.Root>
              <Field.Label>Navigation layout</Field.Label>
              <NativeSelect.Root maxW="sm" disabled={isLoading || isPending}>
                <NativeSelect.Field
                  aria-label="Navigation layout"
                  value={preferences.layout}
                  onChange={(event) => handleLayoutChange(event.currentTarget.value as NavigationLayout)}
                >
                  <option value="compact">Compact</option>
                  <option value="scrollable">Scrollable</option>
                  <option value="grid">Grid launcher</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Field.HelperText>
                {preferences.layout === 'grid'
                  ? 'The launcher grid always contains every destination.'
                  : 'Destinations hidden from the bar remain available from Menu.'}
              </Field.HelperText>
            </Field.Root>

            <Box>
              <Heading as="h4" textStyle="cardTitle" mb="1">
                Destinations
              </Heading>
              <Text color="fg.muted" textStyle="supporting" mb="3">
                Drag using the handle, use the arrow buttons, and choose how each destination appears.
              </Text>
              {compactFull ? (
                <Text color="fg.warning" textStyle="supporting" mb="3">
                  Compact navigation is full. Hide a destination or choose Scrollable to add another.
                </Text>
              ) : null}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragCancel={() => setActiveItemId(null)}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                  <Stack gap="2">
                    {preferences.items.map((item, index) => (
                      <SortableDestination
                        key={item.id}
                        compactFull={compactFull}
                        index={index}
                        item={item}
                        itemCount={preferences.items.length}
                        onDisplayChange={(id, display) =>
                          updateItems((items) => items.map((entry) => (entry.id === id ? { ...entry, display } : entry)))
                        }
                        onMove={moveItem}
                        onVisibilityChange={(id, visible) =>
                          updateItems((items) => items.map((entry) => (entry.id === id ? { ...entry, visible } : entry)))
                        }
                      />
                    ))}
                  </Stack>
                </SortableContext>
                <DragOverlay>
                  {activeItemId ? (
                    <HStack p="4" bg="brand.subtle" color="brand.fg" borderWidth="1px" rounded="lg" shadow="lg">
                      <LuGripVertical aria-hidden />
                      <Text fontWeight="medium">{NAVIGATION_BY_ID.get(activeItemId)?.label}</Text>
                    </HStack>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </Box>

            <HStack gap="3" flexWrap="wrap">
              <Button
                colorPalette="brand"
                loading={isPending}
                disabled={isLoading || isPending || !isDirty}
                onClick={handleSave}
              >
                Save navigation settings
              </Button>
              <Button
                variant="outline"
                colorPalette="gray"
                disabled={isLoading || isPending || !isDirty && JSON.stringify(preferences) === JSON.stringify(DEFAULT_NAVIGATION_PREFERENCES)}
                onClick={() => setPreferences(structuredClone(DEFAULT_NAVIGATION_PREFERENCES))}
              >
                <LuRotateCcw />
                Restore defaults
              </Button>
            </HStack>
          </Stack>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="outline" overflow="hidden">
        <Card.Header>
          <Heading as="h3" textStyle="subsectionTitle">
            Preview
          </Heading>
          <Text color="fg.muted" textStyle="supporting">
            Your unsaved navigation configuration appears here.
          </Text>
        </Card.Header>
        <Card.Body p="0">
          <NavigationSurface preferences={preferences} preview />
        </Card.Body>
      </Card.Root>
    </Stack>
  );
};

export default NavigationSettingsSection;
