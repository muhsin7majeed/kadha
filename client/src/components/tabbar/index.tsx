import { AiFillCheckCircle } from 'react-icons/ai';
import { Tabs } from '@chakra-ui/react';
import { AiOutlineHome } from 'react-icons/ai';
import { Link } from 'react-router';
import { TbListCheck } from 'react-icons/tb';

const TabBar = () => {
  return (
    <>
      <Tabs.Root variant="enclosed" fitted defaultValue={'home'} mx="auto" w="sm">
        <Tabs.List>
          <Tabs.Trigger value="home" asChild>
            <Link to="/">
              <AiOutlineHome size={24} />
            </Link>
          </Tabs.Trigger>

          <Tabs.Trigger value="watchlist" asChild>
            <Link to="/watchlist">
              <TbListCheck size={24} />
            </Link>
          </Tabs.Trigger>

          <Tabs.Trigger value="watched" asChild>
            <Link to="/watched">
              <AiFillCheckCircle size={24} />
            </Link>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    </>
  );
};

export default TabBar;
