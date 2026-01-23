import { BoxProps, Center, Spinner, SpinnerProps } from '@chakra-ui/react';

interface CommonSpinnerProps {
  wrapperProps?: BoxProps;
  spinnerProps?: SpinnerProps;
}

const CommonSpinner: React.FC<CommonSpinnerProps> = ({ wrapperProps, spinnerProps }) => {
  return (
    <Center my="3" {...wrapperProps}>
      <Spinner {...spinnerProps} />
    </Center>
  );
};

export default CommonSpinner;
