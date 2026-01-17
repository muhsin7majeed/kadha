import { LinkOverlay, LinkOverlayProps } from '@chakra-ui/react';
import { Link } from 'react-router';

interface CustomLinkOverlayProps extends LinkOverlayProps {
  to: string;
}

const CustomLinkOverlay = ({ children, ...props }: CustomLinkOverlayProps) => {
  return (
    <LinkOverlay {...props} asChild>
      <Link to={props.to}>{children}</Link>
    </LinkOverlay>
  );
};

export default CustomLinkOverlay;
