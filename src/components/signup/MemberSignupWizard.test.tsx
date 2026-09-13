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

// Regression coverage for swapping steps 3 and 4 (Household <-> Contact): the wizard skips
// the Household step entirely when it doesn't apply (member_type isn't 'Parent' and "register
// household" isn't checked) — that skip logic is keyed to a hardcoded step index, so it must
// point at whichever step Household actually landed on after the swap.
describe('MemberSignupWizard — step order (Household / Contact swap)', () => {
  async function advanceToAboutYou(container: HTMLElement) {
    const user = userEvent.setup();
    await user.type(getEmailInput(container), 'jane@example.com');
    const [password, confirm] = getPasswordInputs(container);
    await user.type(password, 'password123');
    await user.type(confirm, 'password123');
    await user.click(screen.getByRole('checkbox', { name: /accept the terms and conditions/i }));
    await user.click(screen.getByRole('checkbox', { name: /accept the privacy policy/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    return user;
  }

  it('shows Household as step 3 and Contact as step 4 when a household applies', async () => {
    const { container } = renderWizard();
    const user = await advanceToAboutYou(container);

    // First/last name inputs aren't associated to their <Label> via htmlFor, so query by
    // position like the rest of this file does for step 0.
    const textInputs = container.querySelectorAll('input[type="text"], input:not([type])');
    await user.type(textInputs[0] as HTMLInputElement, 'Jane');
    await user.type(textInputs[1] as HTMLInputElement, 'Doe');
    await user.click(screen.getByRole('checkbox', { name: /register household/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('Household & family')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 9')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Contact & address')).toBeInTheDocument();
    expect(screen.getByText('Step 4 of 9')).toBeInTheDocument();
  });

  it('skips the (now step 3) Household step straight to step 4 Contact when no household applies', async () => {
    const { container } = renderWizard();
    const user = await advanceToAboutYou(container);

    const textInputs = container.querySelectorAll('input[type="text"], input:not([type])');
    await user.type(textInputs[0] as HTMLInputElement, 'Jane');
    await user.type(textInputs[1] as HTMLInputElement, 'Doe');
    // Household checkbox left unchecked, and default member_type ('Member') isn't 'Parent'.
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('Contact & address')).toBeInTheDocument();
    expect(screen.getByText('Step 4 of 9')).toBeInTheDocument();

    // Back navigation must skip the hidden Household step in reverse too, landing on About You.
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('Tell us about you')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 9')).toBeInTheDocument();
  });
});
