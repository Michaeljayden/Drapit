-- 018: onboardingreeks (dag 3/10/14) — registratie van verstuurde stappen +
-- dagelijkse trigger via pg_cron → pg_net → POST /api/cron/trial-emails
alter table public.shops
  add column if not exists trial_emails_sent int[] not null default '{}';

comment on column public.shops.trial_emails_sent is
  'Onboardingmails (dag 3/10/14) die al verstuurd zijn; gevuld door /api/cron/trial-emails.';

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- De cron-job zelf (cron.schedule met de CRON_SECRET-header) staat bewust NIET
-- in dit bestand omdat het secret dan in git zou belanden. Hij is op
-- 2026-09-28 direct in de database aangemaakt: jobname 'drapit-trial-emails',
-- schedule '0 8 * * *', POST https://drapit.io/api/cron/trial-emails.
-- Controleren: select jobname, schedule, active from cron.job;
