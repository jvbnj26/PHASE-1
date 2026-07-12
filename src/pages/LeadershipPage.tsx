import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Users } from 'lucide-react';

export default function LeadershipPage() {
  const { boardMembers, executiveCommittee } = useSiteContent();

  return (
    <PublicLayout>
      <PageHero
        eyebrow="About Us"
        title="Management & Leadership"
        subtitle="Meet the Board of Directors and Executive Committee guiding JVBNA."
      />

      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Board */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-border p-7 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-foreground">Board of Directors</h3>
                </div>
                <ol className="space-y-2">
                  {boardMembers.map((member, idx) => (
                    <li key={member.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-section transition-colors">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-foreground text-sm">{member.name}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* EC */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden h-full">
                <div className="bg-gradient-to-r from-primary to-secondary px-7 py-5">
                  <h3 className="font-serif font-bold text-xl text-white">JVBNA EC 2024-25</h3>
                  <p className="text-white/80 text-sm">Executive Committee</p>
                </div>
                <div className="divide-y divide-border">
                  {executiveCommittee.map((member) => (
                    <div key={member.id} className="grid grid-cols-2 gap-4 px-7 py-3 hover:bg-section transition-colors">
                      <span className="text-muted-foreground text-sm font-medium">{member.role}</span>
                      <span className="text-foreground text-sm font-semibold">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
