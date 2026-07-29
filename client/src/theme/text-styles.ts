import { defineTextStyles } from '@chakra-ui/react';

export const textStyles = defineTextStyles({
  pageTitle: {
    description: 'Primary title for an application page',
    value: {
      fontFamily: 'heading',
      fontSize: { base: 'lg', md: 'xl' },
      fontWeight: 'semibold',
      lineHeight: 'short',
    },
  },
  sectionTitle: {
    description: 'Title for a major section, dialog, or application state',
    value: {
      fontFamily: 'heading',
      fontSize: { base: 'md', md: 'lg' },
      fontWeight: 'semibold',
      lineHeight: 'short',
    },
  },
  subsectionTitle: {
    description: 'Title for a nested section or compact content group',
    value: {
      fontFamily: 'heading',
      fontSize: { base: 'sm', md: 'md' },
      fontWeight: 'semibold',
      lineHeight: 'short',
    },
  },
  cardTitle: {
    description: 'Title for media cards and similarly dense content',
    value: {
      fontSize: { base: 'sm', md: 'md' },
      fontWeight: 'bold',
      lineHeight: 'short',
    },
  },
  lead: {
    description: 'Prominent supporting copy used below a title',
    value: {
      fontSize: { base: 'md', md: 'lg' },
      lineHeight: 'tall',
    },
  },
  body: {
    description: 'Default readable application body copy',
    value: {
      fontSize: 'md',
      lineHeight: 'moderate',
    },
  },
  supporting: {
    description: 'Secondary descriptions, counts, and metadata',
    value: {
      fontSize: { base: 'xs', md: 'sm' },
      lineHeight: 'moderate',
    },
  },
  compactLabel: {
    description: 'Compact labels used by tabs and metadata controls',
    value: {
      fontSize: { base: 'xs', md: 'sm' },
      fontWeight: 'medium',
      lineHeight: 'short',
    },
  },
});
