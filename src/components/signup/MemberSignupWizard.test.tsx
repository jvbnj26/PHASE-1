import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MemberSignupWizard from './MemberSignupWizard';

// The wizard imports the real Supabase client at module scope; stub it so this
// test never depends on real env vars or makes network calls (submit() itself
// is never reached from these step-0-only assertions).
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { signUp: vi.fn() },
    from: () => ({ insert: vi.fn(), select: vi.fn() }),
  },
}));

function renderWizard() {
  return render(
    <MemoryRouter>
      <MemberSignupWizard />
    </MemoryRouter>,
  );
}

// The wizard's Field wrapper renders <Label> as a sibling of its input, not
// wrapping it with a `for`/`id` association, so getByLabelText can't find these —
// fall back to querying by input type/order instead.
function getEmailInput(container: HTMLElement) {
  return container.querySelector('input[type="email"]') as HTMLInputElement;
}
function getPasswordInputs(container: HTMLElement) {
  return Array.from(container.querySelectorAll('input[type="password"]')) as HTMLInputElement[];
}

describe('MemberSignupWizard — step 0 (Account)', () => {
  // Regression test: terms/privacy consent checkboxes used to default to `true`
  // (pre-checked), letting a user advance past this step without ever agreeing.
  it('renders the terms and privacy checkboxes unchecked by default', () => {
    renderWizard();
    expect(screen.getByRole('checkbox', { name: /accept the terms and conditions/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /accept the privacy policy/i })).not.toBeChecked();
  });

  it('blocks advancing to step 2 until required consent is checked', async () => {
    const user = userEvent.setup();
    const { container } = renderWizard();

    await user.type(getEmailInput(container), 'jane@example.com');
    const [password, confirm] = getPasswordInputs(container);
    await user.type(password, 'password123');
    await user.type(confirm, 'password123');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Still on step 0 — required consent boxes were never checked.
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 9')).toBeInTheDocument();
  });

  it('advances to step 2 once all required fields and consent are provided', async () => {
    const user = userEvent.setup();
    const { container } = renderWizard();

    await user.type(getEmailInput(container), 'jane@example.com');
    const [password, confirm] = getPasswordInputs(container);
    await user.type(password, 'password123');
    await user.type(confirm, 'password123');
    await user.click(screen.getByRole('checkbox', { name: /accept the terms and conditions/i }));
    await user.click(screen.getByRole('checkbox', { name: /accept the privacy policy/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('Tell us about you')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 9')).toBeInTheDocument();
  });
});
