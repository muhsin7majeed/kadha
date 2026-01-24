import { Icon, IconProps } from '@chakra-ui/react';
import { FaSyncAlt } from 'react-icons/fa';

const SyncSpinner: React.FC<IconProps> = ({ ...props }) => {
  return (
    <Icon css={{ animation: 'spin 1s linear infinite' }} {...props}>
      <FaSyncAlt />
    </Icon>
  );
};

export default SyncSpinner;
