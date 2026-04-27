drop table if exists public.matches cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  full_name text,
  role text check (role in ('user', 'var', 'admin')) default 'user',
  total_points int default 0,
  created_at timestamptz default now()
);

create table public.matches (
  id bigint primary key,
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  match_time timestamptz not null,
  stage text,
  home_score int,
  away_score int,
  status text default 'scheduled'
);

create table public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id bigint references public.matches(id) on delete cascade not null,
  guess_home int not null,
  guess_away int not null,
  points_earned int default 0,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

create table public.side_bets (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  points_value int not null,
  type text check (type in ('team', 'player')),
  deadline timestamptz not null,
  result text
);

create table public.user_side_bets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  side_bet_id uuid references public.side_bets(id) on delete cascade not null,
  answer text not null,
  is_correct boolean default null,
  created_at timestamptz default now()
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'User_' || substr(new.id::text, 1, 5)),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();