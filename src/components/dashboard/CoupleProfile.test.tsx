import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CoupleProfile from './CoupleProfile';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ signOut: vi.fn() }) }));
vi.mock('./NotificationPreferences', () => ({ default: () => <div>Notification choices</div> }));
afterEach(cleanup);

describe('couple profile navigation', () => {
  const showProfile = (entry = '/couple-dashboard?tab=profile') => render(<MemoryRouter initialEntries={[entry]}><CoupleProfile wedding={{ id: 'wedding', couple_names: 'Alex & Sam' }} onEdit={vi.fn()} publishing={<div>Publishing controls</div>} information={<div>Travel details</div>} budget={<div>Expense ledger</div>} readiness={<div>Readiness checklist</div>} /></MemoryRouter>);

  it('keeps secondary controls out of the profile overview', () => {
    showProfile();
    expect(screen.getByText('Alex & Sam')).toBeInTheDocument();
    expect(screen.queryByText('Expense ledger')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Budget Your spending/ }));
    expect(screen.getByText('Expense ledger')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to profile' }));
    expect(screen.getByText('Alex & Sam')).toBeInTheDocument();
    expect(screen.queryByText('Expense ledger')).not.toBeInTheDocument();
  });

  it('supports direct links to profile settings', () => {
    showProfile('/couple-dashboard?tab=profile&section=publishing');
    expect(screen.getByText('Publishing controls')).toBeInTheDocument();
    expect(screen.queryByText('Expense ledger')).not.toBeInTheDocument();
  });
});
