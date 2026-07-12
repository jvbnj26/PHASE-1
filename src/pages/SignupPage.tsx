import PublicLayout from '@/components/layout/PublicLayout';
import MemberSignupWizard from '@/components/signup/MemberSignupWizard';

export default function SignupPage() {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-muted/30 to-background min-h-screen py-6">
        <div className="text-center max-w-2xl mx-auto px-4 pt-6 pb-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Become a member
          </h1>
          <p className="text-muted-foreground">
            Join the JVBNA community. Tell us a bit about yourself — you can always update your details later.
          </p>
        </div>
        <MemberSignupWizard />
      </div>
    </PublicLayout>
  );
}
