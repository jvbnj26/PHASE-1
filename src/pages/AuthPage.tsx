import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Lock, Mail, AlertCircle, ArrowLeft, UserPlus, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import JVBLogo from '@/components/JVBLogo';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, isAuthenticated, loading } = useAuth();

  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const redirectTo = searchParams.get('redirect') || '/';

  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    if (error) {
      setError(error);
    } else {
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <JVBLogo className="w-16 h-16 mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold text-foreground">Welcome to JVBNA</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in or create an account</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Tabs value={tab} onValueChange={(v) => { setTab(v as 'signin' | 'signup'); setError(''); }}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="text-center py-4 space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-foreground">Become a JVBNA Member</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    New members complete our full membership application — it only takes a few minutes and helps us serve you better.
                  </p>
                </div>
                <div className="bg-section rounded-xl p-4 text-left space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-3">What you'll set up:</p>
                  <p>✓ Personal &amp; household information</p>
                  <p>✓ Student/children profiles (if applicable)</p>
                  <p>✓ Event interests &amp; communication preferences</p>
                  <p>✓ Donation preferences</p>
                  <p>✓ Membership account credentials</p>
                </div>
                <Link to="/signup" className="block">
                  <Button className="w-full" size="lg">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Start Membership Application
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  Already submitted an application?{' '}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => setTab('signin')}
                  >
                    Sign in here.
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
