import { Box, BoxProps, Text } from '@chakra-ui/react';
import NavLink from './nav-link';
import SimpleAvatar from './simple-avatar';

interface UserLinkProps extends BoxProps {
  username: string;
}

const UserLink: React.FC<UserLinkProps> = ({ username, ...props }) => {
  return (
    <Box {...props}>
      <NavLink to={`/app/profile/${username}`} display="flex" alignItems="center" gap={3}>
        <SimpleAvatar fallbackName={username} />
        <Text fontWeight="medium">{username}</Text>
      </NavLink>
    </Box>
  );
};

export default UserLink;
