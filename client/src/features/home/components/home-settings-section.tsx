import { arrayMove } from '@dnd-kit/sortable';
import { Button, Card, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuRotateCcw } from 'react-icons/lu';

import useHomePreferences from '@/features/home/api/use-home-preferences';
import useUpdateHomePreferences from '@/features/home/api/use-update-home-preferences';
import { DEFAULT_HOME_PREFERENCES, HOME_SECTION_DETAILS } from '@/features/home/home-defaults';
import type { HomePreferenceItem, HomePreferences } from '@/features/home/home.types';
import ReorderablePreferenceList from '@/features/settings/components/reorderable-preference-list';

const HomeSettingsSection = () => {
  const { data, isLoading } = useHomePreferences();
  const { mutateAsync: updatePreferences, isPending } = useUpdateHomePreferences();
  const [preferences, setPreferences] = useState<HomePreferences>(() => structuredClone(DEFAULT_HOME_PREFERENCES));

  useEffect(() => {
    if (data) setPreferences(structuredClone(data));
  }, [data]);

  const savedPreferences = data ?? DEFAULT_HOME_PREFERENCES;
  const isDirty = JSON.stringify(preferences) !== JSON.stringify(savedPreferences);
  const isDefault = JSON.stringify(preferences) === JSON.stringify(DEFAULT_HOME_PREFERENCES);

  const updateItems = (updater: (items: HomePreferenceItem[]) => HomePreferenceItem[]) => {
    setPreferences((current) => ({ ...current, items: updater(current.items) }));
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= preferences.items.length) return;
    updateItems((items) => arrayMove(items, from, to));
  };

  const handleSave = async () => {
    const saved = await updatePreferences(preferences);
    setPreferences(structuredClone(saved));
  };

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <Heading as="h3" textStyle="subsectionTitle">
          Home sections
        </Heading>
        <Text color="fg.muted" textStyle="supporting">
          Put the useful parts first and hide anything you do not want on Home.
        </Text>
      </Card.Header>
      <Card.Body pt="0">
        <Stack gap="5">
          <ReorderablePreferenceList
            disabled={isLoading || isPending}
            items={preferences.items}
            getLabel={(item) => HOME_SECTION_DETAILS[item.id].label}
            getDescription={(item) => HOME_SECTION_DETAILS[item.id].description}
            onMove={moveItem}
            renderControls={(item) => (
              <HStack as="label" gap="2" cursor={isLoading || isPending ? 'not-allowed' : 'pointer'}>
                <input
                  type="checkbox"
                  aria-label={`Show ${HOME_SECTION_DETAILS[item.id].label} on Home`}
                  checked={item.visible}
                  disabled={isLoading || isPending}
                  onChange={(event) => {
                    const visible = event.currentTarget.checked;
                    updateItems((items) =>
                      items.map((entry) => (entry.id === item.id ? { ...entry, visible } : entry)),
                    );
                  }}
                />
                <Text textStyle="supporting">Show</Text>
              </HStack>
            )}
          />

          <HStack gap="3" flexWrap="wrap">
            <Button
              colorPalette="brand"
              loading={isPending}
              disabled={isLoading || isPending || !isDirty}
              onClick={handleSave}
            >
              Save Home settings
            </Button>
            <Button
              variant="outline"
              colorPalette="gray"
              disabled={isLoading || isPending || isDefault}
              onClick={() => setPreferences(structuredClone(DEFAULT_HOME_PREFERENCES))}
            >
              <LuRotateCcw />
              Restore defaults
            </Button>
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default HomeSettingsSection;
