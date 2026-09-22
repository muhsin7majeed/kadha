import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

const RouteScrollRestoration = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPathname = useRef(pathname);

  useLayoutEffect(() => {
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    if (navigationType === 'POP') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [navigationType, pathname]);

  return null;
};

export default RouteScrollRestoration;
