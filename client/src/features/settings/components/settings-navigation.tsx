import { Button, Field, NativeSelect, Stack } from '@chakra-ui/react';
import { LuDatabase, LuKeyRound, LuPalette, LuShield, LuUserRound } from 'react-icons/lu';
import { Link, useLocation, useNavigate } from 'react-router';

const settingsSections = [
  {
    value: 'account',
    label: 'Account',
    icon: LuUserRound,
  },
  {
    value: 'privacy',
    label: 'Privacy',
    icon: LuShield,
  },
  {
    value: 'appearance',
    label: 'Appearance',
    icon: LuPalette,
  },
  {
    value: 'security',
    label: 'Security',
    icon: LuKeyRound,
  },
  {
    value: 'data',
    label: 'Data',
    icon: LuDatabase,
  },
] as const;

const SettingsNavigation = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeSection =
    settingsSections.find((section) => pathname.startsWith(`/app/settings/${section.value}`))?.value ?? 'account';

  return (
    <>
      <Field.Root display={{ base: 'block', md: 'none' }}>
        <Field.Label>Settings section</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={activeSection}
            onChange={(event) => navigate(`/app/settings/${event.currentTarget.value}`)}
          >
            {settingsSections.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      <Stack
        as="nav"
        aria-label="Settings sections"
        display={{ base: 'none', md: 'flex' }}
        gap="1"
        position="sticky"
        top="20"
      >
        {settingsSections.map((section) => {
          const SectionIcon = section.icon;
          const isActive = activeSection === section.value;

          return (
            <Button
              key={section.value}
              asChild
              colorPalette={isActive ? 'brand' : 'gray'}
              justifyContent="flex-start"
              variant={isActive ? 'subtle' : 'ghost'}
            >
              <Link to={`/app/settings/${section.value}`} aria-current={isActive ? 'page' : undefined}>
                <SectionIcon aria-hidden />
                {section.label}
              </Link>
            </Button>
          );
        })}
      </Stack>
    </>
  );
};

export default SettingsNavigation;
