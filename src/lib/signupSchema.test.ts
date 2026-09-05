import { describe, it, expect } from 'vitest';
import { formSchema, defaultValues } from './signupSchema';

function minimalValid() {
  return {
    ...defaultValues,
    email: 'jane@example.com',
    password: 'password123',
    confirm_password: 'password123',
    terms_accepted: true as const,
    privacy_accepted: true as const,
    first_name: 'Jane',
    last_name: 'Doe',
    street_address: '1 Main St',
    city: 'Iselin',
    state: 'NJ',
    zip_code: '08830',
    photo_video_consent: true as const,
    data_accuracy_confirmation: true as const,
  };
}

describe('signup defaultValues', () => {
  // Regression test for a real bug: these consent/terms fields used to default to
  // `true`, so a user could tab through the wizard and submit without ever
  // checking the "required" consent boxes — they arrived pre-checked.
  it('does not pre-consent the user on any required checkbox', () => {
    expect(defaultValues.terms_accepted).toBe(false);
    expect(defaultValues.privacy_accepted).toBe(false);
    expect(defaultValues.photo_video_consent).toBe(false);
    expect(defaultValues.data_accuracy_confirmation).toBe(false);
  });

  it('fails schema validation as shipped (since consent isn\'t pre-granted)', () => {
    expect(formSchema.safeParse(defaultValues).success).toBe(false);
  });
});

describe('formSchema', () => {
  it('accepts a minimal valid submission', () => {
    const result = formSchema.safeParse(minimalValid());
    expect(result.success).toBe(true);
  });

  it.each(['terms_accepted', 'privacy_accepted', 'photo_video_consent', 'data_accuracy_confirmation'] as const)(
    'rejects submission when %s is false',
    (field) => {
      const data = { ...minimalValid(), [field]: false };
      const result = formSchema.safeParse(data);
      expect(result.success).toBe(false);
    },
  );

  it('rejects mismatched password confirmation', () => {
    const data = { ...minimalValid(), confirm_password: 'somethingElse123' };
    const result = formSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('confirm_password'))).toBe(true);
    }
  });

  it('requires a phone number when opting into SMS', () => {
    const data = { ...minimalValid(), sms_opt_in: true, primary_phone: '' };
    const result = formSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('allows SMS opt-in when a phone number is present', () => {
    const data = { ...minimalValid(), sms_opt_in: true, primary_phone: '732-555-0100' };
    expect(formSchema.safeParse(data).success).toBe(true);
  });

  it('requires parent/guardian consent when children are present', () => {
    const data = {
      ...minimalValid(),
      children: [{ first_name: 'Kid', last_name: 'Doe', photo_video_permission: false, field_trip_permission: false }],
      parent_guardian_consent: false,
    };
    const result = formSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('accepts children when parent/guardian consent is given', () => {
    const data = {
      ...minimalValid(),
      children: [{ first_name: 'Kid', last_name: 'Doe', photo_video_permission: false, field_trip_permission: false }],
      parent_guardian_consent: true,
    };
    expect(formSchema.safeParse(data).success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const data = { ...minimalValid(), email: 'not-an-email' };
    expect(formSchema.safeParse(data).success).toBe(false);
  });

  it('rejects a password under 8 characters', () => {
    const data = { ...minimalValid(), password: 'short', confirm_password: 'short' };
    expect(formSchema.safeParse(data).success).toBe(false);
  });

  it('rejects a profile picture data URL over the size limit', () => {
    const oversized = 'data:image/png;base64,' + 'A'.repeat(2_900_000);
    const data = { ...minimalValid(), profile_picture_url: oversized };
    expect(formSchema.safeParse(data).success).toBe(false);
  });

  it('accepts a profile picture at the size a 2MB upload actually produces as base64', () => {
    // 2MB raw -> ~2.8M base64 chars; this must clear the schema limit or valid
    // uploads that pass the UI's 2MB check get silently rejected on submit.
    const twoMbAsBase64Chars = Math.ceil((2 * 1024 * 1024 * 4) / 3);
    const encoded = 'data:image/png;base64,' + 'A'.repeat(twoMbAsBase64Chars);
    const data = { ...minimalValid(), profile_picture_url: encoded };
    expect(formSchema.safeParse(data).success).toBe(true);
  });

  it('rejects missing required address fields', () => {
    const data = { ...minimalValid(), street_address: '' };
    expect(formSchema.safeParse(data).success).toBe(false);
  });
});
