import PageHeader from '@/components/page-header';
import SimpleCheckboxCardGroup from '@/components/simple-checkbox-card-group';
import { UserMedia } from '@/types/user-media';
import { Box, Text } from '@chakra-ui/react';

const COLLECTIONS = [
  {
    id: 1,
    name: 'First Collection',
    description: 'This is the first collection',
    privacy: 'ONLY_ME',
    items: [
      {
        id: 1,
        name: 'First Item',
      },
    ],
  },
  {
    id: 2,
    name: 'Second Collection',
    description: 'This is the second collection',
    privacy: 'ONLY_ME',
    items: [
      {
        id: 1,
        name: 'Second Item',
      },
    ],
  },
  {
    id: 3,
    name: 'Friends Collection',
    description: 'This is the friends collection',
    privacy: 'FRIENDS',
    items: [
      {
        id: 1,
        name: 'Friend Item',
      },
    ],
  },
  {
    id: 2,
    name: 'Everyone Collection',
    description: 'This is the everyone collection',
    privacy: 'ONLY_ME',
    items: [
      {
        id: 1,
        name: 'Everyone Item',
      },
    ],
  },
  {
    id: 2,
    name: 'Only Me Collection',
    description: 'This is the only me collection',
    privacy: 'ONLY_ME',
    items: [
      {
        id: 1,
        name: 'Only Me Item',
      },
    ],
  },
];

interface AddToCollectionProps {
  media: UserMedia;
}

const AddToCollection: React.FC<AddToCollectionProps> = () => {
  return (
    <Box>
      <PageHeader mb={4}>Add to Collection</PageHeader>

      <SimpleCheckboxCardGroup
        columns={1}
        options={COLLECTIONS.map((collection) => ({
          label: collection.name,
          value: collection.id.toString(),
          element: <Text>{collection.name}</Text>,
        }))}
      />
    </Box>
  );
};

export default AddToCollection;
