import { Button, Stack, Text } from '@chakra-ui/react';
import { LuLayoutGrid } from 'react-icons/lu';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import {
  CompactQuickViewCard,
  ConceptSection,
  EditorialCaptionCard,
  FocusRevealCard,
  QuietPosterCard,
  SplitDecisionCard,
} from './media-card-concepts';
import { MEDIA_CARD_LAB_ITEMS } from './media-card-lab.data';

const MediaCardLabDialog = () => (
  <SimpleDialog
    size="full"
    placement="center"
    closeButton
    title="Media card design lab"
    trigger={
      <Button size="sm" variant="outline" colorPalette="gray">
        <LuLayoutGrid />
        Compare media cards
      </Button>
    }
    contentProps={{ h: '100dvh', maxH: '100dvh', borderRadius: '0' }}
    bodyProps={{ overflowY: 'auto', pb: '10' }}
  >
    <Stack gap="10">
      <Stack gap="2" maxW="3xl">
        <Text textStyle="lead">Five ways to put browsing before management.</Text>
        <Text color="fg.muted" textStyle="body">
          Every concept uses the same three dummy titles. Compare how quickly you can understand the title, decide
          whether it interests you, and see what you have already saved without letting actions take over the card.
        </Text>
      </Stack>

      <ConceptSection
        name="1. Quiet Poster"
        description="Preserves a dense poster grid. Personal state sits in a restrained poster strip while quick information and all mutations remain secondary corner controls."
        items={MEDIA_CARD_LAB_ITEMS}
        renderCard={(media) => <QuietPosterCard media={media} />}
      />

      <ConceptSection
        name="2. Editorial Caption"
        description="Trades some grid density for a readable synopsis and richer caption. This supports decisions without opening another surface, but each title occupies more room."
        items={MEDIA_CARD_LAB_ITEMS}
        renderCard={(media) => <EditorialCaptionCard media={media} />}
      />

      <ConceptSection
        name="3. Split Decision Card"
        description="Uses a responsive media-object layout with synopsis, metadata, status, and quick information visible as one unit. Strong for search and libraries, but intentionally too wide for a carousel."
        items={MEDIA_CARD_LAB_ITEMS}
        renderCard={(media) => <SplitDecisionCard media={media} />}
        wide
      />

      <ConceptSection
        name="4. Focus Reveal"
        description="Keeps the resting card highly visual and reveals the synopsis over the poster on pointer hover or keyboard focus. The explicit info control keeps the same content available on touch screens."
        items={MEDIA_CARD_LAB_ITEMS}
        renderCard={(media) => <FocusRevealCard media={media} />}
      />

      <ConceptSection
        name="5. Compact Poster + Quick View"
        description="Keeps the familiar compact card but turns personal state into passive context and gives Quick info a clear text label. This is the strongest general-purpose candidate if grid density remains important."
        items={MEDIA_CARD_LAB_ITEMS}
        renderCard={(media) => <CompactQuickViewCard media={media} />}
      />
    </Stack>
  </SimpleDialog>
);

export default MediaCardLabDialog;
