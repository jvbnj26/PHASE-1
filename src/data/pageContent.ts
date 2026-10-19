import { PER_ROW_LABELS, type ImageSize } from '@/lib/imageSize';

// Editable fixed text (headings, labels, intro lines, buttons, links, images) for every built-in
// page, grouped into the page's sections in their default top-to-bottom order.
//
// - Admins override any field (Admin > that page); overrides live in the `pageText` site setting
//   under `<page>.<field>`. A missing override means the default below; an empty override means
//   the text is hidden on the page.
// - Sections that aren't `fixed` can be reordered and hidden (the `pageLayout` site setting),
//   mixed in with the page's "Additional Sections".

export type PageTextKind =
  | 'line' // single-line text (headings, labels, button text)
  | 'rich' // formatted paragraph (rich-text editor)
  | 'url' // button / link destination: https://…, /page, #anchor, mailto:, tel:
  | 'image' // uploaded image URL (empty = none)
  | 'map' // Google Maps embed link or a street address
  | 'size'; // image display size: sm | md | lg | full

export interface PageTextField {
  label: string;
  kind: PageTextKind;
  default: string;
  help?: string;
  sizeLabels?: Record<ImageSize, string>; // button labels for 'size' fields
}

export interface PageSectionDef {
  label: string;
  // Fixed sections (page banners, header/footer) always stay in place and can't be hidden.
  fixed?: boolean;
  fields: Record<string, PageTextField>;
}

const line = (label: string, def: string, help?: string): PageTextField => ({ label, kind: 'line', default: def, help });
const rich = (label: string, def: string, help?: string): PageTextField => ({ label, kind: 'rich', default: def, help });
const url = (label: string, def: string, help?: string): PageTextField => ({ label, kind: 'url', default: def, help });
const image = (label: string, help?: string): PageTextField => ({ label, kind: 'image', default: '', help });
const map = (label: string, def: string): PageTextField => ({
  label,
  kind: 'map',
  default: def,
  help: 'Paste a street address, or a Google Maps "Embed a map" link or code. Leave empty to hide the map.',
});

const size = (label: string, def: ImageSize, sizeLabels?: Record<ImageSize, string>, help?: string): PageTextField => ({
  label,
  kind: 'size',
  default: def,
  sizeLabels,
  help,
});

const BANNER_IMAGE_HELP = 'Optional photo behind the page title. Without one, the banner keeps its color gradient.';

const hero = (eyebrow: string, title: string, subtitle: string): PageSectionDef => ({
  label: 'Page Banner',
  fixed: true,
  fields: {
    heroEyebrow: line('Small label above the title', eyebrow),
    heroTitle: line('Page title', title),
    heroSubtitle: rich('Subtitle', subtitle),
    heroImage: image('Background image', BANNER_IMAGE_HELP),
  },
});

const simpleHeader = (title: string): PageSectionDef => ({
  label: 'Page Banner',
  fixed: true,
  fields: {
    pageTitle: line('Page title', title),
    heroImage: image('Background image', BANNER_IMAGE_HELP),
  },
});

export const PAGE_CONTENT = {
  home: {
    label: 'Home',
    sections: {
      welcome: {
        label: 'Welcome',
        fields: {
          mastersPhotoSize: size("Samaniji photo size", 'md', { sm: 'Small', md: 'Medium', lg: 'Large', full: 'Extra large' }),
        },
      },
      events: {
        label: 'Events',
        fields: {
          eventsEyebrow: line('Small label above the heading', 'Stay Connected'),
          eventsHeading: line('Heading', 'Events'),
          eventsCurrentLabel: line('"Ongoing & Upcoming" column label', 'Ongoing & Upcoming'),
          eventsEmpty: line('Text when there are no upcoming events', 'No upcoming events right now — check back soon.'),
          eventsPastLabel: line('"Past Events" column label', 'Past Events'),
          eventsPastEmpty: line('Text when there are no past events', 'No past events yet.'),
          eventsViewAll: line('Button text', 'View All Past Events'),
          eventsViewAllLink: url('Button link', '/events/past'),
        },
      },
      cta: {
        label: 'Join Our Community',
        fields: {
          ctaHeading: line('Heading', 'Join Our Community'),
          ctaText: rich('Text', 'Experience inner peace through Preksha Meditation, Yoga, and the timeless wisdom of Jain philosophy.'),
          ctaButton1: line('Button 1 text', 'Upcoming Events'),
          ctaButton1Link: url('Button 1 link', '/events/upcoming'),
          ctaButton2: line('Button 2 text', 'Get Involved'),
          ctaButton2Link: url('Button 2 link', '/volunteer'),
          ctaButton3: line('Button 3 text', 'Donate Now'),
          ctaButton3Link: url('Button 3 link', '/donate'),
        },
      },
    },
  },

  about: {
    label: 'About Us',
    sections: {
      hero: hero(
        'Who We Are',
        'About JVBNA',
        'Jain Vishwa Bharati of North America — a center for peace, Preksha Meditation, and the timeless values of nonviolence.',
      ),
      intro: { label: 'Introduction', fields: { introHeading: line('Heading', 'A Non-Violent Way of Life') } },
      mission: {
        label: 'Mission',
        fields: {
          missionEyebrow: line('Small label above the heading', 'Our Mission'),
          missionHeading: line('Heading', 'Spreading the universal message'),
        },
      },
      programs: {
        label: 'Programs',
        fields: {
          programsEyebrow: line('Small label above the heading', 'What We Do'),
          programsHeading: line('Heading', 'Our Programs'),
        },
      },
      leadership: {
        label: 'Leadership',
        fields: {
          leadershipEyebrow: line('Small label above the heading', 'Leadership'),
          leadershipHeading: line('Heading', 'Management (Present)'),
          leadershipText: rich('Text', 'Meet the Board of Directors and Executive Committee who guide JVBNA.'),
          leadershipButton: line('Button text', 'View Leadership'),
          leadershipButtonLink: url('Button link', '/about/leadership'),
        },
      },
    },
  },

  donate: {
    label: 'Donations',
    sections: {
      hero: hero(
        'Support Our Mission',
        'Donations',
        'Your generous contribution helps us maintain our centers, support Samanijis, and spread the message of peace and nonviolence.',
      ),
      intro: {
        label: 'Introduction',
        fields: {
          introEyebrow: line('Small label above the heading', 'Why Donate'),
          introHeading: line('Heading', 'JVBNA & Donations'),
        },
      },
      pledge: {
        label: 'Annual Pledge',
        fields: {
          pledgeEyebrow: line('Small label above the heading', 'Annual Pledge'),
          pledgeHeading: line('Heading', '2024 Annual Fund Raising'),
        },
      },
      categories: {
        label: 'Donor Categories',
        fields: {
          categoriesEyebrow: line('Small label above the heading', 'Contribution Tiers'),
          categoriesHeading: line('Heading', 'Donor Categories'),
          categoriesText: rich(
            'Text under the heading',
            "Choose a contribution category during signup and it's already on file — just add your payment info here when you're ready to give.",
          ),
          categoriesImageSize: size('Donor Categories image size', 'full'),
        },
      },
      methods: {
        label: 'How to Donate',
        fields: {
          methodsEyebrow: line('Small label above the heading', 'Choose Your Method'),
          methodsHeading: line('Heading', 'How to Donate'),
          methodsText: rich('Text under the heading', 'Pledge your donation, or directly donate using any of the methods below.'),
        },
      },
      tax: { label: 'Tax Exemption', fields: { taxHeading: line('Heading', 'Tax Exemption') } },
      cta: {
        label: 'Make a Difference',
        fields: {
          ctaHeading: line('Heading', 'Make a Difference Today'),
          ctaText: rich('Text', 'Every contribution, large or small, helps sustain our mission of peace, nonviolence, and spiritual upliftment.'),
          ctaSignedUpAs: line('Signed-in members: "signed up as" label', 'You signed up as:'),
          ctaButton: line('Signed-in members: button text', 'Donate Now'),
          ctaButtonLink: url('Signed-in members: button link', '#how-to-donate', '#how-to-donate scrolls to the "How to Donate" section.'),
          ctaSignInPrompt: line('Signed-out visitors: prompt', 'Please sign in to donate.'),
          ctaSignInButton: line('Signed-out visitors: sign-in button text', 'Sign In to Donate'),
          ctaNewMember: line('Signed-out visitors: text before the signup link', 'New member?'),
          ctaNewMemberLink: line('Signed-out visitors: signup link text', 'Start your membership application.'),
          ctaContact: rich('Contact line', '<p>Questions? Reach out to <strong>Vinodh Anchaliya</strong> · WhatsApp +1 732 619 5500</p>'),
        },
      },
    },
  },

  activities: {
    label: 'Activities',
    sections: {
      hero: hero(
        'Daily Practice',
        'Activities',
        'Weekly sessions, workshops, camps and seminars on Jain principles, Preksha Meditation and yoga — guided by our Samanijis.',
      ),
      intro: {
        label: 'Who It’s For',
        fields: {
          everyoneHeading: line('Left box heading', 'For Everyone'),
          everyoneText: rich(
            'Left box text',
            "Under Samanijis' guidance, JVBNA offers weekly sessions, special workshops, camps and seminars on Jain principles and philosophy; Preksha meditation and yoga — promoting introspection, self-discipline, and spiritual enlightenment.",
          ),
          familiesHeading: line('Right box heading', 'For Children & Families'),
          familiesText: rich(
            'Right box text',
            'JVB Gyanshala for children teaches Jain Philosophy, Science of Living and life values. JVB Gyan-Sabha – Swadhyay sessions for adults and celebrations of Jain and Indian festivals foster a strong sense of community.',
          ),
        },
      },
      ongoing: {
        label: 'Ongoing Activities',
        fields: {
          ongoingEyebrow: line('Small label above the heading', "What's Happening"),
          ongoingHeading: line('Heading', 'Ongoing Activities'),
          datesLabel: line('"Dates:" label on each activity', 'Dates:'),
          zoomLabel: line('Zoom link text on each activity', 'Join via Zoom'),
        },
      },
      calendar: {
        label: 'Calendar Banner',
        fields: {
          calendarHeading: line('Heading', 'Visit JVBNA Calendar of Events'),
          calendarText: rich('Text', 'All sessions can be attended via Zoom, or watched on JVBNA YouTube Channel.'),
          calendarButton: line('Button 1 text', 'View Calendar'),
          calendarButtonLink: url('Button 1 link', '/calendar'),
          youtubeButton: line('Button 2 text', 'YouTube'),
          youtubeButtonLink: url('Button 2 link', 'https://www.youtube.com/@JVBNANewJersey'),
        },
      },
    },
  },

  gyanshala: {
    label: 'Gyanshala',
    sections: {
      hero: hero(
        'Education for Children',
        'Gyanshala',
        "JVBNA's religious school for children — teaching Jain philosophy, the Science of Living, and life values in a warm, welcoming setting.",
      ),
      intro: { label: 'Introduction', fields: {} },
      pillars: { label: 'Pillars', fields: {} },
      coordinators: {
        label: 'Coordinators',
        fields: { coordinatorsHeading: line('Heading', 'Gyanshala Coordinators') },
      },
      cta: {
        label: 'Enrollment Call-to-Action',
        fields: {
          signUpButton: line('Button 1 text', 'Sign Up'),
          signUpButtonLink: url('Button 1 link', '/signup'),
          contactButton: line('Button 2 text', 'Contact Us'),
          contactButtonLink: url('Button 2 link', 'mailto:info@jvbnj.org'),
        },
      },
      dates: {
        label: 'Dates Link',
        fields: {
          datesLinkText: line('Link text', 'See Gyanshala dates on the Activities page'),
          datesLinkUrl: url('Link', '/activities'),
        },
      },
    },
  },

  'spiritual-guidance': {
    label: 'Spiritual Guidance',
    sections: {
      hero: hero(
        'Our Guides',
        'Spiritual Guidance',
        'JVBNA operates under the blessings of visiting Samanijis from Jain Vishwa Bharati, India.',
      ),
      intro: {
        label: 'Introduction Quote',
        fields: {
          introQuote: rich(
            'Quote text',
            '<p>In 1980, under the guidance of Acharya Shri Tulsi and Acharya Shri Mahapragya, a special Jain monk status of <strong>Samani</strong> was established. Samanijis adopt the five prime vows of Jain monk-life — Ahimsa (nonviolence), Satya (truthfulness), Achaurya, Brahmacharya, and Aparigrah — and are committed to purity and detachment for life. They are permitted to travel outside India to propagate the message of Bhagwan Mahaveer.</p>',
          ),
        },
      },
      masters: {
        label: 'Spiritual Masters',
        fields: {
          mastersEyebrow: line('Small label above the heading', 'Resident Samanijis'),
          mastersHeading: line('Heading', 'Our Spiritual Masters'),
          aboutHeading: line('"About" box heading', 'About Our Samanijis'),
          aboutText: rich(
            '"About" box text',
            'JVBNA is blessed to host Samanijis year round. Our resident Samanijis typically hold advanced (Masters and Ph.D.) degrees in Jain Philosophy and Comparative Studies, Science of Living, Sanskrit and English. They are well versed with the practical aspects of common life and are experts in the practice of Preksha (yoga and meditation) and natural health therapies. They provide spiritual guidance to Jains and non-Jains alike, and inspire the community to adopt a non-violent way of life.',
          ),
          socialLabel: line('Label above the social media buttons', 'Follow Their Discourses'),
          mastersPhotoSize: size('Samaniji photo size', 'lg', {
            sm: 'Small (3 per row)',
            md: 'Medium (2 per row)',
            lg: 'Large (2 per row)',
            full: 'Full width (1 per row)',
          }),
        },
      },
    },
  },

  volunteer: {
    label: 'Volunteer',
    sections: {
      hero: hero('Get Involved', 'Volunteer With Us', 'Lend your time, talent, and voice to help our community grow and thrive.'),
      opportunities: {
        label: 'Volunteer Opportunities',
        fields: {
          cardLink: line('Link text on each card', 'Get in touch'),
          cardLinkUrl: url('Link on each card', '/contact'),
        },
      },
      cta: {
        label: 'Call-to-Action & Social',
        fields: {
          ctaHeading: line('Heading', 'Ready to make a difference?'),
          ctaText: rich('Text', 'We are always looking for people with various backgrounds, talents, and skill levels.'),
          ctaButton: line('Button text', 'Contact Us'),
          ctaButtonLink: url('Button link', '/contact'),
          socialLabel: line('Label above the social media buttons', 'Connect With Us'),
        },
      },
    },
  },

  contact: {
    label: 'Contact Us',
    sections: {
      hero: simpleHeader('CONTACT US'),
      mailing: {
        label: 'Samaniji & Mailing Address',
        fields: {
          mailingHeading: line('Heading', 'Samaniji & Mailing Address:'),
          locationLabel: line('"Location" label', 'Location:'),
        },
      },
      mailingMap: {
        label: 'Map — Mailing Address',
        fields: {
          mailingMap: map(
            'Map',
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3031.1234567890123!2d-74.32!3d40.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDM0JzE2LjgiTiA3NMKwMTknMTIuMCJX!5e0!3m2!1sen!2sus!4v1234567890',
          ),
        },
      },
      events: {
        label: 'Events Address',
        fields: { eventsHeading: line('Heading', 'JVBNA Events Address:') },
      },
      eventsMap: {
        label: 'Map — Events Address',
        fields: {
          eventsMap: map(
            'Map',
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3031.1234567890123!2d-74.42!3d40.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDM0JzE2LjgiTiA3NMKwMjUnMTIuMCJX!5e0!3m2!1sen!2sus!4v1234567890',
          ),
        },
      },
      centers: {
        label: 'Parent Organization & Satellite Centers',
        fields: {
          parentHeading: line('Parent organization heading', 'Parent Organization'),
          parentLocation: line('Parent organization location', 'Ladnun, India'),
          satellitesHeading: line('Satellite centers heading', 'Satellite Centers in the USA:'),
          phoneLabel: line('Phone label', 'Ph:'),
        },
      },
    },
  },

  events: {
    label: 'Events',
    sections: {
      hero: {
        label: 'Page Banner',
        fixed: true,
        fields: {
          titleUpcoming: line('Page title — Upcoming tab', 'UPCOMING EVENTS'),
          titleOngoing: line('Page title — Ongoing tab', 'ONGOING EVENTS'),
          titlePast: line('Page title — Past tab', 'PAST EVENTS'),
          heroImage: image('Background image', BANNER_IMAGE_HELP),
        },
      },
      list: {
        label: 'Events List',
        fields: {
          flyerSize: size('Flyer size', 'md', PER_ROW_LABELS, 'On phones, flyers are always one per row.'),
          tabUpcoming: line('"Upcoming" tab', 'Upcoming'),
          tabOngoing: line('"Ongoing" tab', 'Ongoing'),
          tabPast: line('"Past" tab', 'Past Events'),
          signInPrompt: line('Sign-in banner text (signed-out visitors)', 'Sign in to RSVP for events and track your registrations.'),
          signInButton: line('Sign-in banner button', 'Sign In'),
          emptyUpcoming: line('Text when there are no upcoming events', 'No upcoming events at this time.'),
          emptyOngoing: line('Text when there are no ongoing events', 'No ongoing events at this time.'),
          emptyPast: line('Text when there are no past events', 'No past events at this time.'),
          viewPhotos: line('"View Photos" button', 'View Photos'),
        },
      },
    },
  },

  photos: {
    label: 'Photos',
    sections: {
      hero: simpleHeader('PHOTOS'),
      gallery: {
        label: 'Photo Albums',
        fields: {
          coverSize: size('Album cover size', 'md', PER_ROW_LABELS, 'On phones, albums are always one per row.'),
          eyebrow: line('Small label above the heading', 'Shared Albums'),
          heading: line('Heading', 'Our Photo Gallery'),
          intro: rich(
            'Intro text',
            'Browse photos from JVBNA events, Preksha Meditation sessions, Gyanshala programs, Paryushan celebrations, and community gatherings.',
          ),
          viewAlbum: line('"View album" label on each card', 'View album'),
          empty: line('Text when there are no albums', 'Photo albums are coming soon — check back after our next event.'),
          footnote: line('Note under the albums', 'Albums open in Google Photos — no account required to browse.'),
        },
      },
    },
  },

  calendar: {
    label: 'Calendar',
    sections: {
      hero: simpleHeader('CALENDAR'),
      body: {
        label: 'Calendar',
        fields: {
          intro: rich(
            'Intro text',
            'Stay up to date with all JVBNA events, sessions, and activities. Our calendar is synced with Google Calendar for easy access and notifications.',
          ),
          unavailable: line('Text if the calendar can’t load', 'The calendar is temporarily unavailable — please check back soon.'),
          footnote: line('Note under the calendar', 'To add events to your personal calendar, click on an event and select "Copy to my calendar"'),
        },
      },
    },
  },

  leadership: {
    label: 'Leadership',
    sections: {
      hero: hero('About Us', 'Management & Leadership', 'Meet the Board of Directors and Executive Committee guiding JVBNA.'),
      lists: {
        label: 'Board & Executive Committee',
        fields: {
          boardHeading: line('Board heading', 'Board of Directors'),
          ecHeading: line('Executive Committee heading', 'JVBNA EC 2024-25'),
          ecSubheading: line('Executive Committee subheading', 'Executive Committee'),
        },
      },
    },
  },

  blog: {
    label: 'Blog',
    sections: {
      hero: hero('News & Reflections', 'Blog', 'Stories, updates, and spiritual reflections from the JVBNA NJ community.'),
      list: {
        label: 'Blog Posts',
        fields: {
          empty: line('Text when there are no posts', 'No posts yet — check back soon.'),
          loadMore: line('"Load more" button', 'Load more posts'),
        },
      },
    },
  },

  site: {
    label: 'Header & Footer',
    sections: {
      header: {
        label: 'Header',
        fixed: true,
        fields: {
          siteName: line('Site name', 'JAIN VISHWA BHARATI'),
          tagline: line('Tagline', 'Center for Peace and Preksha Meditation'),
        },
      },
      social: {
        label: 'Social Media Links',
        fixed: true,
        fields: {
          facebookUrl: url('Facebook', 'https://facebook.com', 'Leave empty to hide this button everywhere.'),
          flickrUrl: url('Flickr', 'https://flickr.com', 'Leave empty to hide this button everywhere.'),
          youtubeUrl: url('YouTube', 'https://youtube.com', 'Leave empty to hide this button everywhere.'),
        },
      },
      footer: {
        label: 'Footer',
        fixed: true,
        fields: {
          footerHeading: line('Heading', 'JVBNA New Jersey'),
          footerBlurb: rich(
            'Text under the heading',
            'Center for Peace and Preksha Meditation. Promoting nonviolence, inner peace, and spiritual growth through the timeless teachings of Jain philosophy.',
          ),
          quickLinksHeading: line('"Quick Links" heading', 'Quick Links'),
          contactHeading: line('"Contact Us" heading', 'Contact Us'),
          footerAddress: rich('Address', '<p>151 Middlesex Avenue,<br>Iselin, NJ 08830</p>'),
          footerPhone: line('Phone', '848-219-5195'),
          footerEmail: line('Email', 'info@jvbnj.org'),
          hoursHeading: line('"Center Hours" heading', 'Center Hours'),
          hoursText: rich('Hours', '<p>Open for Members and Visitors<br>Seven days a week<br>9:00 AM to 6:00 PM</p>'),
          copyright: line('Copyright line (after © and the year)', 'Jain Vishwa Bharati of North America - New Jersey. All rights reserved.'),
        },
      },
    },
  },
} as const satisfies Record<string, { label: string; sections: Record<string, PageSectionDef> }>;

export type ContentPage = keyof typeof PAGE_CONTENT;
type Sections<P extends ContentPage> = (typeof PAGE_CONTENT)[P]['sections'];
export type SectionId<P extends ContentPage> = keyof Sections<P> & string;
type FieldsOf<T> = T extends { fields: infer F } ? keyof F : never;
export type FieldKey<P extends ContentPage> = { [S in keyof Sections<P>]: FieldsOf<Sections<P>[S]> }[keyof Sections<P>] & string;

export interface PageLayout {
  order: string[]; // section ids, and `extra:<blockId>` for Additional Sections
  hidden: string[];
}

export const extraSectionId = (blockId: string) => `extra:${blockId}`;

export function sectionDefs(page: ContentPage): [string, PageSectionDef][] {
  return Object.entries(PAGE_CONTENT[page].sections as Record<string, PageSectionDef>);
}

export function findField(page: ContentPage, key: string): PageTextField | undefined {
  for (const [, s] of sectionDefs(page)) {
    if (key in s.fields) return s.fields[key];
  }
  return undefined;
}

export const pageTextKey = (page: ContentPage, field: string) => `${page}.${field}`;
