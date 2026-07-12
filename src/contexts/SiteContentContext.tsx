import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  BannerSlide,
  Event,
  Activity,
  BoardMember,
  ExecutiveCommitteeMember,
  SpiritualMaster,
  VolunteerSection,
  ContactInfo,
  SatelliteCenter,
  PopupConfig,
  defaultBannerSlides,
  defaultWelcomeText,
  defaultEvents,
  defaultActivities,
  defaultBoardMembers,
  defaultExecutiveCommittee,
  defaultSpiritualMasters,
  defaultVolunteerSections,
  defaultContactInfo,
  defaultSatelliteCenters,
  defaultAboutContent,
  defaultDonationContent,
  defaultEvents2025,
  defaultActivities2025,
  defaultCalendarUrl,
  defaultPhotosUrl,
  defaultPopupConfig,
} from '@/data/siteContent';

interface SiteContentContextType {
  bannerSlides: BannerSlide[];
  setBannerSlides: (slides: BannerSlide[]) => void;

  welcomeText: { title: string; content: string };
  setWelcomeText: (text: { title: string; content: string }) => void;

  events: Event[];
  setEvents: (events: Event[]) => void;

  activities: Activity[];
  setActivities: (activities: Activity[]) => void;

  boardMembers: BoardMember[];
  setBoardMembers: (members: BoardMember[]) => void;

  executiveCommittee: ExecutiveCommitteeMember[];
  setExecutiveCommittee: (members: ExecutiveCommitteeMember[]) => void;

  spiritualMasters: SpiritualMaster[];
  setSpiritualMasters: (masters: SpiritualMaster[]) => void;

  volunteerSections: VolunteerSection[];
  setVolunteerSections: (sections: VolunteerSection[]) => void;

  contactInfo: ContactInfo;
  setContactInfo: (info: ContactInfo) => void;

  satelliteCenters: SatelliteCenter[];
  setSatelliteCenters: (centers: SatelliteCenter[]) => void;

  aboutContent: typeof defaultAboutContent;
  setAboutContent: (content: typeof defaultAboutContent) => void;

  donationContent: typeof defaultDonationContent;
  setDonationContent: (content: typeof defaultDonationContent) => void;

  events2025: (string | { name: string; subItem: boolean })[];
  setEvents2025: (events: (string | { name: string; subItem: boolean })[]) => void;

  activities2025: (string | { name: string; subItem: boolean })[];
  setActivities2025: (activities: (string | { name: string; subItem: boolean })[]) => void;

  calendarUrl: string;
  setCalendarUrl: (url: string) => void;

  photosUrl: string;
  setPhotosUrl: (url: string) => void;

  popupConfig: PopupConfig;
  setPopupConfig: (cfg: PopupConfig) => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [bannerSlides, setBannerSlidesState] = useState<BannerSlide[]>(defaultBannerSlides);
  const [welcomeText, setWelcomeTextState] = useState(defaultWelcomeText);
  const [events, setEventsState] = useState<Event[]>(defaultEvents);
  const [activities, setActivitiesState] = useState<Activity[]>(defaultActivities);
  const [boardMembers, setBoardMembersState] = useState<BoardMember[]>(defaultBoardMembers);
  const [executiveCommittee, setExecutiveCommitteeState] = useState<ExecutiveCommitteeMember[]>(defaultExecutiveCommittee);
  const [spiritualMasters, setSpiritualMastersState] = useState<SpiritualMaster[]>(defaultSpiritualMasters);
  const [volunteerSections, setVolunteerSectionsState] = useState<VolunteerSection[]>(defaultVolunteerSections);
  const [contactInfo, setContactInfoState] = useState<ContactInfo>(defaultContactInfo);
  const [satelliteCenters, setSatelliteCentersState] = useState<SatelliteCenter[]>(defaultSatelliteCenters);
  const [aboutContent, setAboutContentState] = useState(defaultAboutContent);
  const [donationContent, setDonationContentState] = useState(defaultDonationContent);
  const [events2025, setEvents2025State] = useState<(string | { name: string; subItem: boolean })[]>(
    defaultEvents2025 as (string | { name: string; subItem: boolean })[]
  );
  const [activities2025, setActivities2025State] = useState<(string | { name: string; subItem: boolean })[]>(
    defaultActivities2025 as (string | { name: string; subItem: boolean })[]
  );
  const [calendarUrl, setCalendarUrlState] = useState(defaultCalendarUrl);
  const [photosUrl, setPhotosUrlState] = useState(defaultPhotosUrl);
  const [popupConfig, setPopupConfigState] = useState<PopupConfig>(defaultPopupConfig);

  // Load all settings from Supabase on mount, overriding defaults with DB values
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data, error }) => {
        if (error) {
          console.warn('site_settings load error (using defaults):', error.message);
          return;
        }
        if (!data) return;

        const m = new Map(data.map((r) => [r.key, r.value]));

        if (m.has('bannerSlides'))       setBannerSlidesState(m.get('bannerSlides') as BannerSlide[]);
        if (m.has('welcomeText'))        setWelcomeTextState(m.get('welcomeText') as typeof defaultWelcomeText);
        if (m.has('events'))             setEventsState(m.get('events') as Event[]);
        if (m.has('activities'))         setActivitiesState(m.get('activities') as Activity[]);
        if (m.has('boardMembers'))       setBoardMembersState(m.get('boardMembers') as BoardMember[]);
        if (m.has('executiveCommittee')) setExecutiveCommitteeState(m.get('executiveCommittee') as ExecutiveCommitteeMember[]);
        if (m.has('spiritualMasters'))   setSpiritualMastersState(m.get('spiritualMasters') as SpiritualMaster[]);
        if (m.has('volunteerSections'))  setVolunteerSectionsState(m.get('volunteerSections') as VolunteerSection[]);
        if (m.has('contactInfo'))        setContactInfoState(m.get('contactInfo') as ContactInfo);
        if (m.has('satelliteCenters'))   setSatelliteCentersState(m.get('satelliteCenters') as SatelliteCenter[]);
        if (m.has('aboutContent'))       setAboutContentState(m.get('aboutContent') as typeof defaultAboutContent);
        if (m.has('donationContent'))    setDonationContentState(m.get('donationContent') as typeof defaultDonationContent);
        if (m.has('events2025'))         setEvents2025State(m.get('events2025') as (string | { name: string; subItem: boolean })[]);
        if (m.has('activities2025'))     setActivities2025State(m.get('activities2025') as (string | { name: string; subItem: boolean })[]);
        if (m.has('calendarUrl'))        setCalendarUrlState(m.get('calendarUrl') as string);
        if (m.has('photosUrl'))          setPhotosUrlState(m.get('photosUrl') as string);
        if (m.has('popupConfig'))        setPopupConfigState(m.get('popupConfig') as PopupConfig);
      });
  }, []);

  // Persist a single key to Supabase. Updates local state immediately; write is fire-and-forget.
  const persist = useCallback(async (key: string, value: unknown) => {
    const { error } = await supabase
      .from('site_settings')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({ key, value: value as any, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) toast.error(`Save failed: ${error.message}`);
  }, []);

  // Each setter updates local state synchronously then persists to Supabase in the background.
  const setBannerSlides       = (v: BannerSlide[])                                             => { setBannerSlidesState(v);       persist('bannerSlides', v); };
  const setWelcomeText        = (v: typeof defaultWelcomeText)                                 => { setWelcomeTextState(v);        persist('welcomeText', v); };
  const setEvents             = (v: Event[])                                                   => { setEventsState(v);             persist('events', v); };
  const setActivities         = (v: Activity[])                                                => { setActivitiesState(v);         persist('activities', v); };
  const setBoardMembers       = (v: BoardMember[])                                             => { setBoardMembersState(v);       persist('boardMembers', v); };
  const setExecutiveCommittee = (v: ExecutiveCommitteeMember[])                                => { setExecutiveCommitteeState(v); persist('executiveCommittee', v); };
  const setSpiritualMasters   = (v: SpiritualMaster[])                                        => { setSpiritualMastersState(v);   persist('spiritualMasters', v); };
  const setVolunteerSections  = (v: VolunteerSection[])                                       => { setVolunteerSectionsState(v);  persist('volunteerSections', v); };
  const setContactInfo        = (v: ContactInfo)                                               => { setContactInfoState(v);        persist('contactInfo', v); };
  const setSatelliteCenters   = (v: SatelliteCenter[])                                        => { setSatelliteCentersState(v);   persist('satelliteCenters', v); };
  const setAboutContent       = (v: typeof defaultAboutContent)                               => { setAboutContentState(v);       persist('aboutContent', v); };
  const setDonationContent    = (v: typeof defaultDonationContent)                            => { setDonationContentState(v);    persist('donationContent', v); };
  const setEvents2025         = (v: (string | { name: string; subItem: boolean })[])          => { setEvents2025State(v);         persist('events2025', v); };
  const setActivities2025     = (v: (string | { name: string; subItem: boolean })[])          => { setActivities2025State(v);     persist('activities2025', v); };
  const setCalendarUrl        = (v: string)                                                    => { setCalendarUrlState(v);        persist('calendarUrl', v); };
  const setPhotosUrl          = (v: string)                                                    => { setPhotosUrlState(v);          persist('photosUrl', v); };

  const setPopupConfig = (cfg: PopupConfig) => {
    setPopupConfigState(cfg);
    persist('popupConfig', cfg);
    // Reset dismissal so the updated popup is immediately visible again
    try { sessionStorage.removeItem('jvbna_popup_dismissed_id'); } catch {}
  };

  return (
    <SiteContentContext.Provider
      value={{
        bannerSlides, setBannerSlides,
        welcomeText, setWelcomeText,
        events, setEvents,
        activities, setActivities,
        boardMembers, setBoardMembers,
        executiveCommittee, setExecutiveCommittee,
        spiritualMasters, setSpiritualMasters,
        volunteerSections, setVolunteerSections,
        contactInfo, setContactInfo,
        satelliteCenters, setSatelliteCenters,
        aboutContent, setAboutContent,
        donationContent, setDonationContent,
        events2025, setEvents2025,
        activities2025, setActivities2025,
        calendarUrl, setCalendarUrl,
        photosUrl, setPhotosUrl,
        popupConfig, setPopupConfig,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (context === undefined) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return context;
}
