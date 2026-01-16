import { Link as ChakraLink, LinkProps } from '@chakra-ui/react';
import { Link } from 'react-router';

interface NavLinkProps extends LinkProps {
  children: React.ReactNode;
  to: string;
}
const NavLink: React.FC<NavLinkProps> = ({ children, ...props }) => {
  return (
    <ChakraLink asChild {...props}>
      <Link to={props.to}>{children}</Link>
    </ChakraLink>
  );
};

export default NavLink;
