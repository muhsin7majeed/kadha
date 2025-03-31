import { Outlet } from 'react-router';
import TabBar from '../tabbar';
import Navbar from '../navbar';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <TabBar />
    </>
  );
};

export default MainLayout;
