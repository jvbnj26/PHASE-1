
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "ur select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT, last_name TEXT, preferred_name TEXT,
  date_of_birth DATE, age_group TEXT, gender TEXT, marital_status TEXT,
  occupation TEXT, employer_or_school TEXT, language_preference TEXT,
  member_type TEXT, membership_status TEXT, join_date DATE DEFAULT CURRENT_DATE,
  how_heard_about_us TEXT, referred_by TEXT,
  primary_email TEXT, secondary_email TEXT, primary_phone TEXT, secondary_phone TEXT,
  preferred_contact_method TEXT,
  street_address TEXT, city TEXT, state TEXT, zip_code TEXT, country TEXT,
  emergency_contact_name TEXT, emergency_contact_phone TEXT, emergency_contact_relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_profiles TO authenticated;
GRANT ALL ON public.member_profiles TO service_role;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp sel" ON public.member_profiles FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "mp ins" ON public.member_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "mp upd" ON public.member_profiles FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "mp del" ON public.member_profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_mp BEFORE UPDATE ON public.member_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_name TEXT,
  primary_contact_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  street_address TEXT, city TEXT, state TEXT, zip_code TEXT, country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.households TO authenticated;
GRANT ALL ON public.households TO service_role;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER t_hh BEFORE UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_to_household TEXT,
  is_primary_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.household_members TO authenticated;
GRANT ALL ON public.household_members TO service_role;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hm sel" ON public.household_members FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "hm ins" ON public.household_members FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "hm upd" ON public.household_members FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "hm del" ON public.household_members FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "hh sel" ON public.households FOR SELECT TO authenticated USING (auth.uid()=primary_contact_user_id OR public.has_role(auth.uid(),'admin') OR EXISTS(SELECT 1 FROM public.household_members hm WHERE hm.household_id=households.id AND hm.user_id=auth.uid()));
CREATE POLICY "hh ins" ON public.households FOR INSERT TO authenticated WITH CHECK (auth.uid()=primary_contact_user_id);
CREATE POLICY "hh upd" ON public.households FOR UPDATE TO authenticated USING (auth.uid()=primary_contact_user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "hh del" ON public.households FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
  first_name TEXT, last_name TEXT,
  date_of_birth DATE, school_grade TEXT, religious_class_grade TEXT,
  allergies_medical_notes TEXT,
  emergency_contact_name TEXT, emergency_contact_phone TEXT,
  authorized_pickup_people TEXT,
  photo_video_permission BOOLEAN DEFAULT false,
  field_trip_permission BOOLEAN DEFAULT false,
  parent_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sp sel" ON public.student_profiles FOR SELECT TO authenticated USING (auth.uid()=parent_user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "sp ins" ON public.student_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid()=parent_user_id);
CREATE POLICY "sp upd" ON public.student_profiles FOR UPDATE TO authenticated USING (auth.uid()=parent_user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "sp del" ON public.student_profiles FOR DELETE TO authenticated USING (auth.uid()=parent_user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_sp BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  interested_programs TEXT[],
  current_class_group TEXT,
  previous_religious_education TEXT,
  preferred_program_time TEXT,
  attendance_expectation TEXT,
  accommodations TEXT,
  parent_volunteer_interest BOOLEAN DEFAULT false,
  program_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_enrollments TO authenticated;
GRANT ALL ON public.program_enrollments TO service_role;
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pe sel" ON public.program_enrollments FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pe ins" ON public.program_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "pe upd" ON public.program_enrollments FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pe del" ON public.program_enrollments FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_pe BEFORE UPDATE ON public.program_enrollments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.event_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  interested_event_types TEXT[],
  meal_preference TEXT,
  food_allergies TEXT,
  willing_to_volunteer BOOLEAN DEFAULT false,
  volunteer_areas TEXT[],
  availability TEXT[],
  skills_talents TEXT,
  certifications TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_preferences TO authenticated;
GRANT ALL ON public.event_preferences TO service_role;
ALTER TABLE public.event_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ep sel" ON public.event_preferences FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ep ins" ON public.event_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "ep upd" ON public.event_preferences FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ep del" ON public.event_preferences FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_ep BEFORE UPDATE ON public.event_preferences FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.donation_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  interested_in_donating BOOLEAN DEFAULT false,
  preferred_donation_type TEXT,
  preferred_giving_category TEXT[],
  tax_receipt_needed BOOLEAN DEFAULT false,
  donation_receipt_email TEXT,
  employer_matching_interest BOOLEAN DEFAULT false,
  anonymous_donation_preference BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donation_preferences TO authenticated;
GRANT ALL ON public.donation_preferences TO service_role;
ALTER TABLE public.donation_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dp sel" ON public.donation_preferences FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "dp ins" ON public.donation_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "dp upd" ON public.donation_preferences FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "dp del" ON public.donation_preferences FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_dp BEFORE UPDATE ON public.donation_preferences FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  general_announcements BOOLEAN DEFAULT true,
  event_reminders BOOLEAN DEFAULT true,
  donation_reminders BOOLEAN DEFAULT false,
  volunteer_requests BOOLEAN DEFAULT false,
  emergency_alerts BOOLEAN DEFAULT true,
  newsletter_frequency TEXT,
  preferred_language TEXT,
  whatsapp_group_interest BOOLEAN DEFAULT false,
  do_not_contact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communication_preferences TO authenticated;
GRANT ALL ON public.communication_preferences TO service_role;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp sel" ON public.communication_preferences FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cp ins" ON public.communication_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "cp upd" ON public.communication_preferences FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cp del" ON public.communication_preferences FOR DELETE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_cp BEFORE UPDATE ON public.communication_preferences FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_guardian_consent BOOLEAN DEFAULT false,
  photo_video_consent BOOLEAN DEFAULT false,
  sms_consent BOOLEAN DEFAULT false,
  email_consent BOOLEAN DEFAULT false,
  data_accuracy_confirmation BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  consent_source TEXT,
  consent_ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consents TO authenticated;
GRANT ALL ON public.consents TO service_role;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "co sel" ON public.consents FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "co ins" ON public.consents FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "co upd" ON public.consents FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "co del" ON public.consents FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_co BEFORE UPDATE ON public.consents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'admin',
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notes TO authenticated;
GRANT ALL ON public.admin_notes TO service_role;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "an all" ON public.admin_notes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER t_an BEFORE UPDATE ON public.admin_notes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "al sel" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "al ins" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid()=changed_by);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  IF NEW.email = 'admin@jvbnj.org' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
