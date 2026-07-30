import { Heading, Stack, Text } from '@chakra-ui/react';

interface SettingsSectionHeaderProps {
  description: string;
  title: string;
}

const SettingsSectionHeader = ({ description, title }: SettingsSectionHeaderProps) => (
  <Stack gap="1">
    <Heading as="h2" textStyle="sectionTitle">
      {title}
    </Heading>
    <Text color="fg.muted" textStyle="supporting">
      {description}
    </Text>
  </Stack>
);

export default SettingsSectionHeader;
