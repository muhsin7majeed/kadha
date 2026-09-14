import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';
import ProductShowcase from './product-showcase';

describe('ProductShowcase', () => {
  it('exposes the initial slide and labelled carousel controls', () => {
    renderWithProviders(<ProductShowcase />);

    expect(screen.getByRole('region', { name: 'Kadha product tour' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Your year at a glance, slide 1 of 4');
    expect(screen.getByRole('button', { name: 'Previous screenshot' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next screenshot' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show Your year at a glance' })).toHaveAttribute(
      'aria-current',
      'true',
    );

    const slides = screen.getAllByRole('figure', { hidden: true });
    expect(slides[0]).toHaveAttribute('aria-hidden', 'false');
    slides.slice(1).forEach((slide) => expect(slide).toHaveAttribute('aria-hidden', 'true'));
  });

  it('moves directly, wraps, and responds to arrow keys', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductShowcase />);

    await user.click(screen.getByRole('button', { name: 'Next screenshot' }));
    expect(screen.getByRole('status')).toHaveTextContent('Always know what is next, slide 2 of 4');
    const slides = screen.getAllByRole('figure', { hidden: true });
    expect(slides[0]).toHaveAttribute('aria-hidden', 'true');
    expect(slides[1]).toHaveAttribute('aria-hidden', 'false');

    await user.click(screen.getByRole('button', { name: 'Show Share one list, not your whole profile' }));
    expect(screen.getByRole('status')).toHaveTextContent('Share one list, not your whole profile, slide 3 of 4');

    fireEvent.keyDown(screen.getByRole('region', { name: 'Kadha product tour' }), { key: 'ArrowRight' });
    expect(screen.getByRole('status')).toHaveTextContent('Privacy in plain sight, slide 4 of 4');

    await user.click(screen.getByRole('button', { name: 'Next screenshot' }));
    expect(screen.getByRole('status')).toHaveTextContent('Your year at a glance, slide 1 of 4');

    await user.click(screen.getByRole('button', { name: 'Previous screenshot' }));
    expect(screen.getByRole('status')).toHaveTextContent('Privacy in plain sight, slide 4 of 4');
  });
});
