import { AiFillCheckCircle } from 'react-icons/ai';
import { Tabs } from '@chakra-ui/react';
import { AiOutlineHome } from 'react-icons/ai';
import { Link } from 'react-router';
import { TbListCheck } from 'react-icons/tb';

const TabBar = () => {
  return (
    <>
      <Tabs.Root
        variant="enclosed"
        maxW="md"
        fitted
        defaultValue={'home'}
        position={'fixed'}
        bottom={5}
        left={'50%'}
        transform="translate(-50%)"
        w="90%"
      >
        <Tabs.List>
          <Tabs.Trigger value="home" asChild>
            <Link to="/">
              <AiOutlineHome />
            </Link>
          </Tabs.Trigger>

          <Tabs.Trigger value="watched" asChild>
            <Link to="/watched">
              <AiFillCheckCircle />
            </Link>
          </Tabs.Trigger>

          <Tabs.Trigger value="watchlist" asChild>
            <Link to="/watchlist">
              <TbListCheck />
            </Link>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
    </>
  );
};

export default TabBar;
