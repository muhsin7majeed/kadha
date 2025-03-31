import Home from '@/pages/home';
import { Box, Tabs } from '@chakra-ui/react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { AiOutlineHome } from 'react-icons/ai';
import { TbListCheck } from 'react-icons/tb';
import { Link, Route, Routes } from 'react-router';

const AppContainer = () => {
  return (
    <>
      <Box marginBottom={4}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="watched" element={<div>Watched</div>} />
          <Route path="watchlist" element={<div>Watchlist</div>} />
        </Routes>
      </Box>

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

export default AppContainer;
