import { CheckboxCard, Spinner } from '@chakra-ui/react';

interface SimpleCheckboxCardProps extends CheckboxCard.RootProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  isLoading?: boolean;
}

const SimpleCheckboxCard: React.FC<SimpleCheckboxCardProps> = ({ label, description, isLoading, ...props }) => {
  return (
    <CheckboxCard.Root {...props} disabled={isLoading}>
      <CheckboxCard.HiddenInput />

      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <CheckboxCard.Label>{label}</CheckboxCard.Label>

          {description && <CheckboxCard.Description>{description}</CheckboxCard.Description>}
        </CheckboxCard.Content>

        {isLoading ? <Spinner size="sm" /> : <CheckboxCard.Indicator />}
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
};

export default SimpleCheckboxCard;
