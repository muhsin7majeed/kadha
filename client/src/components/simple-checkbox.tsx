import { Box, Checkbox, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type SimpleCheckboxProps = Omit<Checkbox.RootProps, 'children'> & {
  label: ReactNode;
  description?: ReactNode;
};

const SimpleCheckbox = ({ label, description, ...props }: SimpleCheckboxProps) => (
  <Checkbox.Root alignItems="flex-start" gap="2" {...props}>
    <Checkbox.HiddenInput />
    <Checkbox.Control mt={description ? '0.5' : undefined} />
    <Box>
      <Checkbox.Label fontWeight="medium">{label}</Checkbox.Label>
      {description ? (
        <Text color="fg.muted" textStyle="supporting" mt="0.5">
          {description}
        </Text>
      ) : null}
    </Box>
  </Checkbox.Root>
);

export default SimpleCheckbox;
