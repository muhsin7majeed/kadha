import { Outlet } from 'react-router';
import TabBar from '../tabbar';

const MainLayout = () => {
  return (
    <>
      <Outlet />
      <TabBar />
    </>
  );
};

export default MainLayout;
