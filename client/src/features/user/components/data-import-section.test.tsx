import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import DataImportSection from './data-import-section';

const mocks = vi.hoisted(() => ({
  importData: vi.fn(),
  previewImport: vi.fn(),
  resetPreview: vi.fn(),
  preview: {
    source: {
      username: 'ashe',
      exportedAt: '2026-09-05T00:00:00.000Z',
      schemaVersion: 2,
    },
    availableCategories: ['accountPreferences', 'mediaTracking', 'watchHistory'] as const,
    importable: {
      accountPreferences: 1,
      media: 47,
      watchEvents: 290,
      collections: 0,
      collectionItems: 0,
      recommendationSettings: 0,
      recommendationFeedback: 0,
    },
    unsupported: {
      friendships: 2,
      notifications: 3,
      collectionMemberships: 1,
      collectionInvites: 0,
      activity: 96,
    },
    conflicts: { collections: 0 },
    warnings: [],
  },
}));

vi.mock('@/features/user/api/use-preview-user-import', () => ({
  default: () => ({
    mutate: mocks.previewImport,
    data: mocks.preview,
    isPending: false,
    reset: mocks.resetPreview,
  }),
}));

vi.mock('@/features/user/api/use-import-user-data', () => ({
  default: () => ({ mutate: mocks.importData, isPending: false }),
}));

describe('DataImportSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.previewImport.mockImplementation((_payload, options) => options?.onSuccess?.(mocks.preview));
  });

  it('defaults account preferences off and imports selected detected categories', async () => {
    renderWithProviders(<DataImportSection />);
    const file = new File([JSON.stringify({ schemaVersion: 1, account: { username: 'ashe' } })], 'export.json', {
      type: 'application/json',
    });
    Object.defineProperty(file, 'text', {
      value: () => Promise.resolve(JSON.stringify({ schemaVersion: 1 })),
    });

    fireEvent.change(screen.getByLabelText('Export file'), {
      target: { files: [file] },
    });

    const accountPreferences = await screen.findByRole('checkbox', {
      name: /Account preferences/,
    });
    expect(accountPreferences).not.toBeChecked();
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /Media tracking/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Watch history/ })).toBeChecked();
    });
    expect(
      screen.getByText('Watch history can move between accounts. Friendships are less portable.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Import selected data' }));

    await waitFor(() => {
      expect(mocks.importData).toHaveBeenCalledWith(
        expect.objectContaining({
          options: { categories: ['mediaTracking', 'watchHistory'] },
        }),
      );
    });
  });

  it('lets the user select or clear every detected category', async () => {
    renderWithProviders(<DataImportSection />);
    const file = new File(['{}'], 'export.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: () => Promise.resolve('{}') });
    fireEvent.change(screen.getByLabelText('Export file'), {
      target: { files: [file] },
    });

    await screen.findByRole('checkbox', { name: /Account preferences/ });
    fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeChecked());

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByRole('button', { name: 'Import selected data' })).toBeDisabled();
  });
});
