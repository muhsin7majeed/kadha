import { arrayMove } from "@dnd-kit/sortable";
import {
  Box,
  Button,
  Card,
  Field,
  Heading,
  HStack,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { LuRotateCcw } from "react-icons/lu";

import SimpleCheckbox from "@/components/simple-checkbox";
import ListSkeleton from "@/components/loading/list-skeleton";
import LoadingStatus from "@/components/loading/loading-status";

import useNavigationPreferences from "@/features/navigation/api/use-navigation-preferences";
import useUpdateNavigationPreferences from "@/features/navigation/api/use-update-navigation-preferences";
import { NavigationSurface } from "@/features/navigation/components/navigation-surface";
import { DEFAULT_NAVIGATION_PREFERENCES } from "@/features/navigation/navigation-defaults";
import { NAVIGATION_BY_ID } from "@/features/navigation/navigation-registry";
import type {
  NavigationItemDisplay,
  NavigationLayout,
  NavigationPreferenceItem,
  NavigationPreferences,
} from "@/features/navigation/navigation.types";
import ReorderablePreferenceList from "@/features/settings/components/reorderable-preference-list";

const fitCompactCapacity = (items: NavigationPreferenceItem[]) => {
  let optionalSlots = 4;
  return items.map((item) => {
    if (item.id === "home" || item.id === "menu" || !item.visible) return item;
    const visible = optionalSlots > 0;
    optionalSlots -= 1;
    return visible ? item : { ...item, visible: false };
  });
};

const NavigationSettingsSection = () => {
  const { data, isLoading, isFetching } = useNavigationPreferences();
  const { mutateAsync: updatePreferences, isPending } =
    useUpdateNavigationPreferences();
  const [preferences, setPreferences] = useState<NavigationPreferences>(() =>
    structuredClone(DEFAULT_NAVIGATION_PREFERENCES),
  );

  useEffect(() => {
    if (data) setPreferences(structuredClone(data));
  }, [data]);

  const savedPreferences = data ?? DEFAULT_NAVIGATION_PREFERENCES;
  const isDirty =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);
  const compactFull =
    preferences.layout === "compact" &&
    preferences.items.filter((item) => item.visible).length >= 6;

  const updateItems = (
    updater: (items: NavigationPreferenceItem[]) => NavigationPreferenceItem[],
  ) => {
    setPreferences((current) => ({
      ...current,
      items: updater(current.items),
    }));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= preferences.items.length) return;
    updateItems((items) => arrayMove(items, from, to));
  };

  const handleLayoutChange = (layout: NavigationLayout) => {
    setPreferences((current) => ({
      ...current,
      layout,
      items:
        layout === "compact"
          ? fitCompactCapacity(current.items)
          : current.items,
    }));
  };

  const handleSave = async () => {
    const saved = await updatePreferences(preferences);
    setPreferences(structuredClone(saved));
  };

  if (isLoading) return <ListSkeleton label="Loading navigation settings" rows={5} />;

  return (
    <Stack gap="5">
      {isFetching && <LoadingStatus />}
      <Card.Root variant="outline">
        <Card.Header>
          <Heading as="h3" textStyle="subsectionTitle">
            Tab bar layout
          </Heading>
          <Text color="fg.muted" textStyle="supporting">
            Choose a compact bar, a freely scrolling bar, or an app-style grid
            launcher.
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
                  onChange={(event) =>
                    handleLayoutChange(
                      event.currentTarget.value as NavigationLayout,
                    )
                  }
                >
                  <option value="compact">Compact</option>
                  <option value="scrollable">Scrollable</option>
                  <option value="grid">Grid launcher</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Field.HelperText>
                {preferences.layout === "grid"
                  ? "The launcher grid always contains every destination."
                  : "Destinations hidden from the bar remain available from Menu."}
              </Field.HelperText>
            </Field.Root>

            <Box>
              <Heading as="h4" textStyle="cardTitle" mb="1">
                Destinations
              </Heading>
              <Text color="fg.muted" textStyle="supporting" mb="3">
                Drag using the handle, use the arrow buttons, and choose how
                each destination appears.
              </Text>
              {compactFull ? (
                <Text color="fg.warning" textStyle="supporting" mb="3">
                  Compact navigation is full. Hide a destination or choose
                  Scrollable to add another.
                </Text>
              ) : null}

              <ReorderablePreferenceList
                disabled={isLoading || isPending}
                items={preferences.items}
                getLabel={(item) =>
                  NAVIGATION_BY_ID.get(item.id)?.label ?? item.id
                }
                getDescription={(item) =>
                  item.id === "home" || item.id === "menu"
                    ? "Always available"
                    : undefined
                }
                onMove={moveItem}
                renderLeading={(item) => {
                  const destination = NAVIGATION_BY_ID.get(item.id);
                  if (!destination) return null;
                  const DestinationIcon = destination.icon;
                  return <DestinationIcon aria-hidden />;
                }}
                renderControls={(item) => {
                  const destination = NAVIGATION_BY_ID.get(item.id);
                  if (!destination) return null;
                  const mandatory = item.id === "home" || item.id === "menu";

                  return (
                    <>
                      <SimpleCheckbox
                        ariaLabel={`Show ${destination.label} in navigation`}
                        checked={item.visible}
                        disabled={
                          isLoading ||
                          isPending ||
                          mandatory ||
                          (!item.visible && compactFull)
                        }
                        label="Show"
                        onCheckedChange={(details) => {
                          const visible = details.checked === true;
                          updateItems((items) =>
                            items.map((entry) =>
                              entry.id === item.id
                                ? { ...entry, visible }
                                : entry,
                            ),
                          );
                        }}
                      />

                      <NativeSelect.Root
                        size="sm"
                        w="32"
                        disabled={isLoading || isPending}
                      >
                        <NativeSelect.Field
                          aria-label={`${destination.label} appearance`}
                          value={item.display}
                          onChange={(event) => {
                            const display = event.currentTarget
                              .value as NavigationItemDisplay;
                            updateItems((items) =>
                              items.map((entry) =>
                                entry.id === item.id
                                  ? { ...entry, display }
                                  : entry,
                              ),
                            );
                          }}
                        >
                          <option value="both">Icon + label</option>
                          <option value="icon">Icon only</option>
                          <option value="label">Label only</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </>
                  );
                }}
              />
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
                disabled={
                  isLoading ||
                  isPending ||
                  (!isDirty &&
                    JSON.stringify(preferences) ===
                      JSON.stringify(DEFAULT_NAVIGATION_PREFERENCES))
                }
                onClick={() =>
                  setPreferences(
                    structuredClone(DEFAULT_NAVIGATION_PREFERENCES),
                  )
                }
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
