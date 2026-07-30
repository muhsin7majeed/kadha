import { Button, Card, Heading, Text } from '@chakra-ui/react';
import { LuDownload } from 'react-icons/lu';

import useExportUserData from '@/features/user/api/use-export-user-data';

interface DataExportSectionProps {
  headingAs?: 'h2' | 'h3';
}

const DataExportSection = ({ headingAs = 'h2' }: DataExportSectionProps) => {
  const { mutate: exportUserData, isPending: isExporting } = useExportUserData();

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <Heading as={headingAs} textStyle="subsectionTitle">
          Export
        </Heading>
        <Text color="fg.muted" textStyle="supporting">
          Download a JSON copy of your account, media, collections, social data, notifications, and activity.
        </Text>
      </Card.Header>
      <Card.Body>
        <Button
          variant="outline"
          colorPalette="gray"
          onClick={() => exportUserData()}
          loading={isExporting}
          disabled={isExporting}
        >
          <LuDownload />
          Export my data
        </Button>
      </Card.Body>
    </Card.Root>
  );
};

export default DataExportSection;
