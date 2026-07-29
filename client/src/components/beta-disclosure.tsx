import { Box, Container, HStack, Icon, Text } from '@chakra-ui/react';
import { LuInfo } from 'react-icons/lu';

interface BetaDisclosureProps {
  contained?: boolean;
}

const BetaDisclosureContent = () => (
  <HStack gap={3} align="center" justify="center" p="3">
    <Icon color="brand.fg" mt={0.5} flexShrink={0}>
      <LuInfo />
    </Icon>
    <Text textStyle="supporting" color="fg.muted">
      Kadha is in early beta. There's a chance I might fuck up your data during testing / development lol.
    </Text>
  </HStack>
);

const BetaDisclosure = ({ contained = true }: BetaDisclosureProps) => {
  const content = (
    <Box bg="brand.subtle" borderRadius="md" borderBottomWidth="1px" borderColor="border" py={3}>
      {contained ? (
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <BetaDisclosureContent />
        </Container>
      ) : (
        <BetaDisclosureContent />
      )}
    </Box>
  );

  return content;
};

export default BetaDisclosure;
