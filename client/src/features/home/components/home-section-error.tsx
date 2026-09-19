import { Button, Card, Heading, Stack, Text } from '@chakra-ui/react';

const HomeSectionError = ({ description, onRetry, title }: { description: string; onRetry: () => void; title: string }) => (
  <Card.Root variant="outline">
    <Card.Body>
      <Stack align="flex-start" gap="2">
        <Heading as="h2" textStyle="sectionTitle">
          {title}
        </Heading>
        <Text color="fg.muted" textStyle="supporting">
          {description}
        </Text>
        <Button size="sm" variant="outline" colorPalette="gray" onClick={onRetry}>
          Try again
        </Button>
      </Stack>
    </Card.Body>
  </Card.Root>
);

export default HomeSectionError;
