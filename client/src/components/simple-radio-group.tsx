import { GenericLabelValue } from '@/types/common';
import { RadioGroup, HStack, Text } from '@chakra-ui/react';

interface SimpleRadioGroupProps extends RadioGroup.RootProps {
  options: GenericLabelValue[];
  label?: string;
}

const SimpleRadioGroup: React.FC<SimpleRadioGroupProps> = ({ options, label, ...props }) => {
  return (
    <RadioGroup.Root {...props}>
      {label && <Text mb={2}>{label}</Text>}

      <HStack gap="6">
        {options.map((option) => (
          <RadioGroup.Item value={option.value}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator />
            <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </HStack>
    </RadioGroup.Root>
  );
};

export default SimpleRadioGroup;
