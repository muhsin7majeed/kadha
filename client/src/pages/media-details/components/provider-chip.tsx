import { HStack, Image, Link, Text } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';

import type { WatchProvider } from '@/features/media/media.types';
import { getProviderSearchLink } from './watch-provider-links';

interface ProviderChipProps {
  provider: WatchProvider;
  sourceLink: string | null;
  title: string;
}

const ProviderChipContent = ({ provider }: { provider: WatchProvider }) => (
  <>
    {provider.logoUrl && (
      <Image
        src={provider.logoUrl}
        alt={`${provider.name} logo`}
        boxSize="6"
        borderRadius="sm"
        objectFit="cover"
        flexShrink={0}
      />
    )}
    <Text fontSize="sm" fontWeight="medium">
      {provider.name}
    </Text>
  </>
);

const providerChipStyles = {
  gap: 2,
  px: 3,
  py: 2,
  borderWidth: '1px',
  borderColor: 'border',
  bg: 'bg.subtle',
  borderRadius: 'md',
  minH: '10',
} as const;

const ProviderChip = ({ provider, sourceLink, title }: ProviderChipProps) => {
  const providerLink = getProviderSearchLink(provider, title);
  const link = providerLink ?? sourceLink;

  if (!link) {
    return (
      <HStack {...providerChipStyles}>
        <ProviderChipContent provider={provider} />
      </HStack>
    );
  }

  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${providerLink ? 'Search' : 'View availability'} on ${provider.name}`}
      _hover={{ textDecoration: 'none' }}
    >
      <HStack
        {...providerChipStyles}
        transition="background 120ms ease, border-color 120ms ease"
        _hover={{ bg: 'bg.muted', borderColor: 'brand.muted' }}
      >
        <ProviderChipContent provider={provider} />
        <LuExternalLink size={14} />
      </HStack>
    </Link>
  );
};

export default ProviderChip;
