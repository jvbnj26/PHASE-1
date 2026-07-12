-- site_settings: JSONB key-value store for all CMS-managed website content
-- Replaces browser localStorage as the persistence layer for SiteContentContext

create table if not exists public.site_settings (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

grant select                       on public.site_settings to anon, authenticated;
grant insert, update, delete       on public.site_settings to authenticated;
grant all                          on public.site_settings to service_role;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read"  on public.site_settings;
drop policy if exists "site_settings_auth_insert"  on public.site_settings;
drop policy if exists "site_settings_auth_update"  on public.site_settings;
drop policy if exists "site_settings_auth_delete"  on public.site_settings;

-- Anyone can read site content (needed for public pages)
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

-- Writes require authentication (matches custom_pages pattern; admin route guard enforces admin-only access at the app layer)
create policy "site_settings_auth_insert"
  on public.site_settings for insert
  to authenticated
  with check (true);

create policy "site_settings_auth_update"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

create policy "site_settings_auth_delete"
  on public.site_settings for delete
  to authenticated
  using (true);

-- =========================================================
-- Seed default CMS content
-- Dollar-quoting ($j$...$j$) avoids SQL-level quote escaping.
-- JSON \n sequences are interpreted by the JSONB parser as newlines.
-- =========================================================

insert into public.site_settings (key, value) values

('bannerSlides', $j$[
  {"id":"1","imageUrl":"banner-mahapragya","title":"","subtitle":"","order":1},
  {"id":"2","imageUrl":"/placeholder.svg","title":"Discover Inner Peace","subtitle":"Through Preksha Meditation and Yoga","order":2},
  {"id":"3","imageUrl":"/placeholder.svg","title":"Join Our Community","subtitle":"Weekly Sessions, Workshops & Events","order":3},
  {"id":"4","imageUrl":"/placeholder.svg","title":"Spiritual Guidance","subtitle":"Under the blessings of Acharya Shri Mahapragya-ji","order":4}
]$j$::jsonb),

('welcomeText', $j${
  "title": "Welcome to JVBNA New Jersey!",
  "content": "JVBNA – Jain Vishwa Bharati of North America, the center for Peace and Preksha Meditation was established in the year 2003, with the blessings of Acharya Mahapragya-ji. Our center is guided by the presence of our learned Samanijis (Jain ascetics) assigned by and under the auspicious guidance of Acharya Mahashraman, the spiritual head of Jain Vishwa Bharati, India.\n\nIn service to our community, the overarching aims of this center are to inculcate strong personal values and to encourage enlightened thinking that leads to promoting peace and spiritual uplift within all individuals and across the spectrum of humanity without any avaricious motives."
}$j$::jsonb),

('events', $j$[
  {"id":"1","title":"Bhikshu Bhakti","date":"September 20th, 2025","description":"A spiritually enriching evening of devotion, discipline, and deep connection with the teachings of Bhikshu Swami.","imageUrl":"event-bhikshu-bhakti","type":"upcoming","rsvpLink":"#"},
  {"id":"2","title":"JVBNA Gyanshala 2025-26","date":"Register by September 1st, 2025","description":"Under the Auspicious Presence & Guidance of Samani Samatva Pragyaji & Samani Abhay Pragyaji","imageUrl":"/placeholder.svg","videoUrl":"/videos/arham-event.mp4","type":"upcoming","registrationLink":"#"},
  {"id":"3","title":"Morning Prayer Session","date":"Daily","description":"Preksha Meditation & Adhyatmik Anushthan (Bhaktamar, Meditation & Sacred Mantras)","imageUrl":"/placeholder.svg","type":"ongoing"},
  {"id":"4","title":"Evening Preksha Meditation Session","date":"Monday - Friday","description":"Get rid of all your stresses and Awaken your Inner Strength","imageUrl":"/placeholder.svg","type":"ongoing"},
  {"id":"5","title":"Mahavir Jayanti & Swagat Samaroh","date":"April 5th, 2025","description":"JVBNA NJ celebrated the Mahavir Jayanti and Welcome to Samani Samatva Pragyaji and Samani Arjav Pragyaji.","imageUrl":"/placeholder.svg","type":"past"},
  {"id":"6","title":"Dharma Aradhana Session","date":"April 27th, 2025","description":"The recent Agama Swadhyaya session held in person at JVBNA Iselin Center.","imageUrl":"/placeholder.svg","type":"past"}
]$j$::jsonb),

('activities', $j$[
  {"id":"1","title":"Swadhyay","description":"Self-study and spiritual learning sessions","items":[]},
  {"id":"2","title":"Science of Living","description":"Practical application of Jain philosophy","items":["Preksha Meditation","Yoga","Pranayam"]},
  {"id":"3","title":"Gyanshala & Youth Toastmasters","description":"Education programs for children and youth","items":[],"dates":"February 18, March 3, 17, 31, April 7, 21, May 5, May 19"},
  {"id":"4","title":"Community Service","description":"Giving back to our community","items":[]},
  {"id":"5","title":"Community Engagement Series","description":"Building connections within our community","items":[]}
]$j$::jsonb),

('boardMembers', $j$[
  {"id":"1","name":"Surendra Kankariya (Chairman)","order":1},
  {"id":"2","name":"Ashok Bhansali (Co-chairman)","order":2},
  {"id":"3","name":"B.C. Jain","order":3},
  {"id":"4","name":"Kamal Daga","order":4},
  {"id":"5","name":"Madhumita Sacheti","order":5},
  {"id":"6","name":"Paayal Vora","order":6},
  {"id":"7","name":"Sheetal Daftary","order":7},
  {"id":"8","name":"Suparas Nahata","order":8},
  {"id":"9","name":"Vinodh Anchaliya","order":9},
  {"id":"10","name":"Ashish Jain","order":10}
]$j$::jsonb),

('executiveCommittee', $j$[
  {"id":"1","role":"President","name":"Vinod Anchaliya","order":1},
  {"id":"2","role":"Vice President","name":"Shweta Daftary","order":2},
  {"id":"3","role":"General Secretary","name":"Piyush Rampuria","order":3},
  {"id":"4","role":"General Joint Secretary","name":"Sudeep Surana","order":4},
  {"id":"5","role":"Social Media Coordinator","name":"Prachi Shah","order":5},
  {"id":"6","role":"Social Media Co-Coordinator","name":"Pratiti Dugad","order":6},
  {"id":"7","role":"Social Media Co-Coordinator","name":"Depika Anchaliya","order":7},
  {"id":"8","role":"Treasurer","name":"Sudhir Jain","order":8},
  {"id":"9","role":"Fund Raising","name":"Mahipal Singhvi","order":9},
  {"id":"10","role":"Family Events Coordinator","name":"Vandana Nahata","order":10},
  {"id":"11","role":"EC Events Coordinator","name":"Sonya Doshi","order":11},
  {"id":"12","role":"Gyanshala Coordinator","name":"Shweta Rampuria","order":12},
  {"id":"13","role":"Gyanshala Co-Coordinator","name":"Vijayalakshmi Jain","order":13},
  {"id":"14","role":"Community Engagement Coordinator","name":"Rupal Bhandari","order":14},
  {"id":"15","role":"Community Engagement Co-Coordinator","name":"Rupali Kucherlya","order":15},
  {"id":"16","role":"Community Engagement Co-Coordinator","name":"Nitin Chordiya","order":16},
  {"id":"17","role":"Cultural Programs Coordinator","name":"Venus Jain","order":17},
  {"id":"18","role":"Cultural Programs Co-Coordinator","name":"Sonu Lodha","order":18},
  {"id":"19","role":"Community Service Coordinator","name":"Hina Harkawat","order":19},
  {"id":"20","role":"Specialized Projects Coordinator","name":"Snehal Harkawat","order":20},
  {"id":"21","role":"Spiritual Programs Coordinator","name":"Prashant Nahar","order":21},
  {"id":"22","role":"Gochari Coordinator","name":"Varsha Mehta","order":22},
  {"id":"23","role":"Food Coordinator","name":"Rekha Jain","order":23},
  {"id":"24","role":"Food Co-Coordinators","name":"Vijay Baid","order":24},
  {"id":"25","role":"Food Co-Coordinators","name":"Sanjay Bhansali","order":25},
  {"id":"26","role":"AV & Tech Coordinator","name":"Dakshesh Lodha","order":26},
  {"id":"27","role":"AV & Tech Co-coordinator","name":"Lokesh Jain","order":27}
]$j$::jsonb),

('spiritualMasters', $j$[
  {"id":"1","name":"Samani Samatva Pragya","imageUrl":"samani-samatva-pragya","description":"Our resident Samanijis typically hold advanced (Masters and Ph.D.) degrees in Jain Philosophy and Comparative Studies, Science of Living, Sanskrit and English etc."},
  {"id":"2","name":"Samani Abhay Pragya","imageUrl":"samani-abhay-pragya","description":"They are also well versed with the practical aspects of common life. These monks are experts in the practice of Preksha (yoga and meditation) and other natural health therapies."}
]$j$::jsonb),

('volunteerSections', $j$[
  {"id":"1","title":"Volunteering","description":"There are many ways you can volunteer within our community. Contact us for opportunities to volunteer – we are always looking for people with various backgrounds, talents, and skill levels. Please email us if you are interested to volunteer for this great cause.","icon":"Heart"},
  {"id":"2","title":"Outreach/Teach","description":"We all want to contribute to our Jain community by helping our children. In little ways that we can, teach our children the values of Jainism, the Hindi language, Yoga, Art, and Music. If you have time to spare and enjoy teaching, then contact us. We are always looking for talented teachers.","icon":"GraduationCap"},
  {"id":"3","title":"Advocate","description":"Help us support the objectives of JVBNA using social media. Read and share stories with thousands of people whose lives have intersected with Jainism. Like our Facebook page today. Subscribe to our YouTube channel and subscribe to our JVBNA newsletters.","icon":"Megaphone"}
]$j$::jsonb),

('contactInfo', $j${
  "mailingAddress": {
    "name": "Jain Vishwa Bharati of North America",
    "street": "151 Middlesex Avenue",
    "city": "Iselin",
    "state": "New Jersey",
    "zip": "08830",
    "phone": ["848-219-5195", "732-404-1430"],
    "email": ["info@jvbnj.org", "samaniji@jvbnj.org"]
  },
  "eventsAddress": {
    "name": "Center for Peace and Preksha Meditation (CPPM)",
    "street": "155 Front St",
    "city": "South Plainfield",
    "state": "New Jersey",
    "zip": "07080"
  },
  "hours": "JVBNA Center is open for Members and Visitors seven days from 9:00am to 6:00pm (To schedule appointments by phone, please call 732-404-1430 or 973-818-1740)"
}$j$::jsonb),

('satelliteCenters', $j$[
  {"id":"1","city":"Ladnun","state":"India","name":"Jain Vishwa Bharati, India","street":"Post Box No. 8, Post – Ladnun – 341 306, Dist. Nagaur, Rajasthan (India)","phone":"+91-1581-226025, 226080, 224671","email":["secretariatldn@jvbharati.org"],"website":"www.jvbharati.org"},
  {"id":"2","city":"Orlando","state":"FL","name":"Jain Vishwa Bharati USA","street":"7819 Lillwill Avenue, Orlando, FL 32809","phone":"407-852-8694","email":["info@jainvishwabharati.org","jainvishwa1@gmail.com"],"website":"www.jvborlando.org"},
  {"id":"3","city":"Houston","state":"TX","name":"Jain Vishwa Bharati Houston","street":"14102 Schiller Road, Houston, TX 77082","phone":"281-596-YOGA (9642)","email":["info@jvbhouston.org","samaniji@jvbhouston.org"],"website":"www.jvbhouston.org"}
]$j$::jsonb),

('aboutContent', $j${
  "intro": "In a world beleaguered with personal conflict and global turmoil, the relevance of a Non-Violent way of life cannot be overemphasized. \"I am right but so are you\" – as man grasps the Jain concept of divergent perspectives and respects another unconditionally, social and communal harmonies are sure to follow. The Jain notion of nonviolence extends to all forms of life and nature, and stretches beyond mere physical nonviolence. It shows the way to mental peace, social harmony, and the preservation of natural ecological balance.\n\nJVBNA strives to convey these timeless values of life and sustainable co-existence to the world at large. Jain Vishwa Bharati (JVB) was established by the farsighted vision of Acharya Shri Tulsi and Acharya Shri Mahapragya in Ladnun, India in 1970. Presently, JVB is privileged to receive its inspiration from Acharya Shri Mahashraman. JVBNA operates under the guidance of visiting Samanijis from Jain Vishwa Bharati, India.\n\nJain Vishwa Bharati of North America (JVBNA) is one of three satellite organizations of JVB in USA, and enjoys a permanent facility – the JVBNA Center in Iselin, New Jersey – inaugurated in 2003 and progressing towards inaugurating a new facility in South Plainfield, right at 155 Front Street.",
  "mission": "Our mission is to spread the universal message of Jain philosophy and wisdom to the world for cultivating an atmosphere which nurtures nonviolence, self-restraint, and divergent perspectives; and thereby leads to spiritual enlightenment for man for fostering sustainable co-existence, unity and social harmony for all mankind.",
  "programs": "We as JVB aim to accomplish our major activities and programs based on few pillar themes for enriching people's life:",
  "programSections": [
    {
      "title": "Nonviolence for Day-to-Day Life",
      "content": "JVB endeavors to cultivate a nonviolent culture in society at large. Occupation and profession, food and drinks, dress and decoration, and communication and entertainment all these are the part and partial of individual's life. JVB organizes such programs like philosophical discourses, seminars, work-shops that give a clear understanding, knowledge and courage to adopt the nonviolent culture with confidence in every field of life."
    },
    {
      "title": "Health Education for Inner Peace",
      "content": "Health is a state of complete physical, mental and social well-being, and not merely the absence of disease or infirmity. Our mental and emotional state not only affects our attitudes but has a direct impact on our physical health. Jain scripture has explained in detail the relationship of Himsa (violence) and Ahimsa (nonviolence), with the mental and physical state of a person. Jainism has also prescribed various methods to control and maintain our physical and mental health. Preksha is one such practical and systematic method for healthy living."
    },
    {
      "title": "Preksha Meditation and Yoga",
      "content": "Meditation and Yogasana help to establish a balance between our body and mind. It also mends our violent mind-set and awakens spirituality. JVB offers various form of Preksha session to address the needs of a broad cross-section of individuals; including children, youths, elderly people, regular practitioners, and the American society at large. Special retreats and Summer Camps are conducted targeting Preksha Meditation, depicting its practical application in day-to-day life."
    }
  ]
}$j$::jsonb),

('donationContent', $j${
  "intro": "JVBNA is a non profit and as such is run entirely on your contributions. Irrespective of any situation, we continue maintaining our both centers and continue spending money for its day to day operations. To cover these costs (like daily maintenance, utilities, unexpected repairs, Samani ji related expenses), we do ask for donations ONLY once in a year (during Paryushan).\n\nIn addition, JVBNA also drives many fund raising event throughout the year to support specific causes, where the fund raised is strictly dedicated to that cause. You at the time of donation can also specify how your funds should be put to use among the available categories.\n\nWe sincerely hope, you will continue supporting JVB New Jersey as before.",
  "pledgeInfo": "We are grateful to you for supporting our organization by generous donations.\nWe are fortunate to have continued presence of Samanijis enlightening us with spiritual pursuits all round the year. In light of costs that have gone up post covid to approximately 30% plus from travel tickets, to visa, to both center maintenance, insurance, camp cost etc, after careful consideration we have revised the donation amount for each category.",
  "donationMethods": [
    {"title":"Pay by CHECK","description":"You can either mail check or hand it over to any EC member.","details":"Address to mail check: 151 Middlesex Avenue, Iselin, NJ 08830. Payable to: JVBNA. Memo: Donation category"},
    {"title":"Pay using Bank account (ACH method)","description":"Preferred and Safe - Use QR Code or bank transfer","details":""},
    {"title":"International Donors","description":"Outside USA donors, please use PayPal.","details":""}
  ],
  "taxInfo": "Your Contribution to our organization may entitle for tax exemption under section 501c, charitable organization."
}$j$::jsonb),

('events2025', $j$[
  "Jan 1 – New Year Mangal Path",
  "Jan 25 – Mangal Kamana Samaroh",
  "Apr 5 – Mahavir Jayanti & Swagat Samaroh",
  "May 10 – Path of Ahimsa",
  "May 31 – Gyanotsav",
  "Jun 6-8 – Family Camp",
  "Aug 20 – 27 – Paryushan Mahaparva",
  "Sep 20 – Bhikshu Jaap",
  "Oct 25 – Mahavir Nirwan Diwas & Diwali Milan",
  "Golden Awakening: Celebration of 50 Years of Preksha Meditation"
]$j$::jsonb),

('activities2025', $j$[
  "Swadhyay",
  "Science of Living",
  {"name":"Preksha Meditation","subItem":true},
  {"name":"Yoga","subItem":true},
  {"name":"Pranayam","subItem":true},
  "Gyanshala",
  "Youth Toastmasters",
  "Community Service",
  "Community Engagement Series",
  {"name":"Mar 2 – Bhajan/Karaoke/Games","subItem":true}
]$j$::jsonb),

('calendarUrl', $j$"https://calendar.google.com/calendar/embed?src=your-calendar-id&ctz=America%2FNew_York"$j$::jsonb),

('photosUrl', $j$"https://photos.google.com/share/your-shared-album-link"$j$::jsonb),

('popupConfig', $j${"enabled":true,"mode":"auto"}$j$::jsonb)

on conflict (key) do nothing;
