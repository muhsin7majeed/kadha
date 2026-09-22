import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import RouteScrollRestoration from './route-scroll-restoration';

const NavigationHarness = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <output data-testid="location">{location.pathname}{location.search}</output>
      <button onClick={() => navigate('/app/media/movie/1')}>Open detail</button>
      <button onClick={() => navigate('/app/watchlist?page=2')}>Change page</button>
      <button onClick={() => navigate(-1)}>Go back</button>
    </>
  );
};

const renderNavigation = (initialEntries: string[], initialIndex?: number) =>
  renderWithProviders(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <RouteScrollRestoration />
      <NavigationHarness />
    </MemoryRouter>,
  );

describe('RouteScrollRestoration', () => {
  it('scrolls the document to the top when the pathname changes through a new navigation', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });
    renderNavigation(['/app/watchlist']);

    fireEvent.click(screen.getByRole('button', { name: 'Open detail' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('does not reset document scroll for same-path query changes', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });
    renderNavigation(['/app/watchlist']);

    fireEvent.click(screen.getByRole('button', { name: 'Change page' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/app/watchlist?page=2');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('does not override browser history restoration on POP navigation', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });
    renderNavigation(['/app/watchlist', '/app/media/movie/1'], 1);

    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/app/watchlist');
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
