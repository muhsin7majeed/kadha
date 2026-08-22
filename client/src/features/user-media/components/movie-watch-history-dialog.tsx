import SimpleDialog from '@/components/dialogs/simple-dialog';
import type { UserMediaPayload } from '../user-media.types';
import { MovieWatchHistoryContent } from './movie-watch-history-section';

interface MovieWatchHistoryDialogProps {
  media: UserMediaPayload;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const MovieWatchHistoryDialog = ({ media, onOpenChange, open }: MovieWatchHistoryDialogProps) => (
  <SimpleDialog
    open={open}
    onOpenChange={(details) => onOpenChange(details.open)}
    title="Watch history"
    closeButton
    contentProps={{ width: { base: 'calc(100vw - 2rem)', md: '2xl' }, maxW: '2xl', maxH: 'calc(100vh - 2rem)' }}
    bodyProps={{ overflowY: 'auto' }}
  >
    <MovieWatchHistoryContent media={media} showHeading={false} />
  </SimpleDialog>
);

export default MovieWatchHistoryDialog;
