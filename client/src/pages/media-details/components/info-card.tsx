import { Box, Text, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface InfoCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

const InfoCard = ({ label, value, icon }: InfoCardProps) => {
  return (
    <VStack align="start" gap={1} p={4} bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="border">
      <Text fontSize="sm" color="fg.muted" fontWeight="medium">
        {label}
      </Text>
      <Box display="flex" alignItems="center" gap={2}>
        {icon}
        <Text fontSize="md" fontWeight="semibold">
          {value || 'N/A'}
        </Text>
      </Box>
    </VStack>
  );
};

export default InfoCard;
