import { useState } from 'react';
import { Box, Button, CloseButton, Dialog, Heading, Portal, Stack, Text } from '@chakra-ui/react';

import { changelogMarkdown } from '@/generated/changelog';

interface ChangelogDialogProps {
  version: string;
}

const headingSizes = {
  1: 'lg',
  2: 'md',
  3: 'sm',
} as const;

function renderMarkdownLine(line: string, index: number) {
  if (line.startsWith('### ')) {
    return (
      <Heading key={index} as="h4" size={headingSizes[3]} mt={3}>
        {line.replace('### ', '')}
      </Heading>
    );
  }

  if (line.startsWith('## ')) {
    return (
      <Heading key={index} as="h3" size={headingSizes[2]} mt={4}>
        {line.replace('## ', '')}
      </Heading>
    );
  }

  if (line.startsWith('# ')) {
    return (
      <Heading key={index} as="h2" size={headingSizes[1]}>
        {line.replace('# ', '')}
      </Heading>
    );
  }

  if (line.startsWith('- ')) {
    return (
      <Box key={index} display="flex" gap={2} color="fg.muted" lineHeight="1.7">
        <Text as="span" aria-hidden="true">
          -
        </Text>
        <Text as="span">{line.replace('- ', '')}</Text>
      </Box>
    );
  }

  return (
    <Text key={index} color="fg.muted" lineHeight="1.7">
      {line}
    </Text>
  );
}

const ChangelogDialog = ({ version }: ChangelogDialogProps) => {
  const [open, setOpen] = useState(false);

  const renderedLines = changelogMarkdown
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(renderMarkdownLine);

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        px={2}
        color="fg.muted"
        lineHeight="1"
        whiteSpace="nowrap"
        onClick={() => setOpen(true)}
        aria-label={`View changelog for Kadha version ${version}`}
        title="View changelog"
      >
        v{version}
      </Button>

      <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)} size="lg" scrollBehavior="inside">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxH="85vh">
              <Dialog.Header>
                <Dialog.Title>Kadha v{version}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <Stack gap={2} pb={2}>
                  {renderedLines}
                </Stack>
              </Dialog.Body>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default ChangelogDialog;
