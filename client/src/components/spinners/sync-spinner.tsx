import { Icon, IconProps } from '@chakra-ui/react';
import { LuRefreshCw } from 'react-icons/lu';

const SyncSpinner: React.FC<IconProps> = ({ ...props }) => {
  return (
    <Icon css={{ animation: 'spin 1s linear infinite' }} {...props}>
      <LuRefreshCw />
    </Icon>
  );
};

export default SyncSpinner;
