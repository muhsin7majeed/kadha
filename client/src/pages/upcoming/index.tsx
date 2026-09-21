import { Box } from '@chakra-ui/react';

import PageHeader from '@/components/page-header';
import UpcomingPageContent from '@/features/upcoming/components/upcoming-page-content';

const Upcoming = () => (
  <Box>
    <PageHeader subHeader="Upcoming episodes and releases for titles you track. Dates can change as providers update their listings.">
      Upcoming
    </PageHeader>
    <UpcomingPageContent />
  </Box>
);

export default Upcoming;
