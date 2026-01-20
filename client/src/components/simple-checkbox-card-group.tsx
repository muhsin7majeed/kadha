import { Box, BoxProps, CheckboxCard, CheckboxGroup, SimpleGrid, SimpleGridProps, Text } from '@chakra-ui/react';
import { GenericLabelValue } from '@/types/common';

interface SimpleCheckboxCardGroupProps extends BoxProps {
  options: (GenericLabelValue & { element: React.ReactNode })[];
  label?: string;
  columns?: SimpleGridProps['columns'];
}

const SimpleCheckboxCardGroup: React.FC<SimpleCheckboxCardGroupProps> = ({ label, options, columns = 2, ...props }) => {
  return (
    <Box {...props}>
      <CheckboxGroup>
        {label && <Text mb={2}>{label}</Text>}

        <SimpleGrid gap="2" columns={columns}>
          {options.map((option) => (
            <CheckboxCard.Root key={option.value} value={option.value}>
              <CheckboxCard.HiddenInput />

              <CheckboxCard.Control>
                <CheckboxCard.Content>
                  <CheckboxCard.Label>{option.label}</CheckboxCard.Label>

                  <CheckboxCard.Description>{option.element}</CheckboxCard.Description>
                </CheckboxCard.Content>

                <CheckboxCard.Indicator />
              </CheckboxCard.Control>
            </CheckboxCard.Root>
          ))}
        </SimpleGrid>
      </CheckboxGroup>
    </Box>
  );
};

export default SimpleCheckboxCardGroup;
