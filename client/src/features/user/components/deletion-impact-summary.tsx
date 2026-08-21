import { List, Stack, Text } from '@chakra-ui/react';

import { DeletionImpact } from '@/features/user/account-deletion.types';
import { ResolvedDeletionPlan } from '@/features/user/account-deletion-plan';

interface DeletionImpactSummaryProps {
  impact: DeletionImpact;
  plan: ResolvedDeletionPlan;
  compact?: boolean;
}

const DeletionImpactSummary = ({ impact, plan, compact = false }: DeletionImpactSummaryProps) => (
  <Stack gap="2">
    <Text fontWeight="medium" textStyle={compact ? 'body' : 'cardTitle'}>
      {compact ? 'Resolved collection outcome' : 'Deleting your account will:'}
    </Text>
    <List.Root ps="5" textStyle="body">
      {impact.unsharedOwnedCollectionCount > 0 && (
        <List.Item>
          Delete {impact.unsharedOwnedCollectionCount} private or unshared{' '}
          {impact.unsharedOwnedCollectionCount === 1 ? 'collection' : 'collections'}.
        </List.Item>
      )}
      <List.Item>
        Transfer {plan.transferredCollectionCount}{' '}
        {plan.transferredCollectionCount === 1 ? 'collection' : 'collections'}.
      </List.Item>
      <List.Item>
        Permanently delete {plan.deletedCollectionCount}{' '}
        {plan.deletedCollectionCount === 1 ? 'collection' : 'collections'}.
      </List.Item>
      {plan.collaboratorsLosingAccessCount > 0 && (
        <List.Item>
          Remove collection access for {plan.collaboratorsLosingAccessCount}{' '}
          {plan.collaboratorsLosingAccessCount === 1 ? 'collaborator' : 'collaborators'}.
        </List.Item>
      )}
      {impact.membershipsToLeaveCount > 0 && (
        <List.Item>
          Remove you from {impact.membershipsToLeaveCount}{' '}
          {impact.membershipsToLeaveCount === 1 ? 'collection' : 'collections'} owned by other users.
        </List.Item>
      )}
    </List.Root>
  </Stack>
);

export default DeletionImpactSummary;
