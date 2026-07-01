import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box, Button, Heading, Link, Stack, Text } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import { changelogMarkdown } from '@/generated/changelog';

interface ChangelogDialogProps {
  version: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: (props: { label: string; onOpen: () => void }) => ReactNode;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <Heading as="h2" size="lg" mb={2}>
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading as="h3" size="md" mt={5} mb={2}>
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as="h4" size="sm" mt={4} mb={1}>
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading as="h5" size="xs" mt={3} mb={1}>
      {children}
    </Heading>
  ),
  p: ({ children }) => (
    <Text color="fg.muted" lineHeight="1.7">
      {children}
    </Text>
  ),
  ul: ({ children }) => (
    <Stack as="ul" gap={1} ps={5}>
      {children}
    </Stack>
  ),
  ol: ({ children }) => (
    <Stack as="ol" gap={1} ps={5}>
      {children}
    </Stack>
  ),
  li: ({ children }) => (
    <Box as="li" color="fg.muted" lineHeight="1.7">
      {children}
    </Box>
  ),
  a: ({ children, href }) => (
    <Link href={href} color="brand.fg" textDecoration="underline" textUnderlineOffset="3px">
      {children}
    </Link>
  ),
  code: ({ children }) => (
    <Box as="code" bg="bg.muted" borderRadius="sm" px={1} py={0.5} fontSize="sm">
      {children}
    </Box>
  ),
  blockquote: ({ children }) => (
    <Box borderLeftWidth="3px" borderColor="border" ps={4} color="fg.muted">
      {children}
    </Box>
  ),
};

const ChangelogDialog = ({ version, open, onOpenChange, trigger }: ChangelogDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const label = `View changelog for Kadha version ${version}`;
  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;

  return (
    <>
      {trigger ? (
        trigger({ label, onOpen: () => setDialogOpen(true) })
      ) : open === undefined ? (
        <Button
          variant="ghost"
          size="xs"
          px={2}
          color="fg.muted"
          lineHeight="1"
          whiteSpace="nowrap"
          onClick={() => setDialogOpen(true)}
          aria-label={label}
          title="View changelog"
        >
          v{version}
        </Button>
      ) : (
        null
      )}

      <SimpleDialog
        open={dialogOpen}
        onOpenChange={(details) => setDialogOpen(details.open)}
        size="cover"
        scrollBehavior="inside"
        title={`Kadha v${version}`}
        closeButton
        contentProps={{ maxH: { base: '100dvh', md: '85vh' } }}
      >
        <Stack gap={2} pb={2}>
          <ReactMarkdown components={markdownComponents}>{changelogMarkdown}</ReactMarkdown>
        </Stack>
      </SimpleDialog>
    </>
  );
};

export default ChangelogDialog;
