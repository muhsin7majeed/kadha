import { Box, Text } from '@chakra-ui/react';

import PageHeader from '@/components/page-header';
import UpcomingPageContent from '@/features/upcoming/components/upcoming-page-content';

const Upcoming = () => (
  <Box>
    <PageHeader subHeader="Upcoming episodes for shows and watchlist movies you already track.">Upcoming</PageHeader>
    <UpcomingPageContent />
    <Text color="fg.muted" textStyle="supporting" mt="6">
      Your upcoming schedule is private and visible only to you. Dates can change when providers update their listings.
    </Text>
  </Box>
);

export default Upcoming;
