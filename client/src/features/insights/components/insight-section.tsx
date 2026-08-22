import { Card, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface InsightSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const InsightSection = ({ title, description, children }: InsightSectionProps) => (
  <Card.Root as="section" variant="outline">
    <Card.Body gap="4">
      <Stack gap="1">
        <Heading as="h3" textStyle="sectionTitle">
          {title}
        </Heading>
        {description && (
          <Text color="fg.muted" textStyle="supporting">
            {description}
          </Text>
        )}
      </Stack>
      {children}
    </Card.Body>
  </Card.Root>
);

export default InsightSection;
