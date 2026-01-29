import { Avatar } from '@chakra-ui/react';

interface SimpleAvatarProps extends Avatar.RootProps {
  src?: string;
  fallbackName?: string;
}

const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ src, fallbackName }) => {
  return (
    <Avatar.Root>
      <Avatar.Image src={src} />
      <Avatar.Fallback name={fallbackName} />
    </Avatar.Root>
  );
};

export default SimpleAvatar;
