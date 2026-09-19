import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import useOwnerLibraryView, { ownerLibraryViewStorageKey } from './use-owner-library-view';

describe('useOwnerLibraryView', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to grid and persists view changes', () => {
    const { result } = renderHook(() => useOwnerLibraryView('liked'));

    expect(result.current.view).toBe('grid');

    act(() => result.current.setView('list'));

    expect(result.current.view).toBe('list');
    expect(window.localStorage.getItem(ownerLibraryViewStorageKey('liked'))).toBe('list');
  });

  it('restores a valid stored view and rejects an invalid value', () => {
    window.localStorage.setItem(ownerLibraryViewStorageKey('watched'), 'table');
    window.localStorage.setItem(ownerLibraryViewStorageKey('watchlist'), 'poster-wall');

    const restored = renderHook(() => useOwnerLibraryView('watched'));
    const invalid = renderHook(() => useOwnerLibraryView('watchlist'));

    expect(restored.result.current.view).toBe('table');
    expect(invalid.result.current.view).toBe('grid');
  });

  it('keeps each owner library preference independent', () => {
    const liked = renderHook(() => useOwnerLibraryView('liked'));
    const watched = renderHook(() => useOwnerLibraryView('watched'));

    act(() => liked.result.current.setView('list'));
    act(() => watched.result.current.setView('table'));

    expect(window.localStorage.getItem(ownerLibraryViewStorageKey('liked'))).toBe('list');
    expect(window.localStorage.getItem(ownerLibraryViewStorageKey('watched'))).toBe('table');
    expect(window.localStorage.getItem(ownerLibraryViewStorageKey('watchlist'))).toBeNull();
  });
});
