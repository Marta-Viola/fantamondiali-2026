// "/", la home

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RankingWidget from '@/components/RankingWidget'
import MatchWidget, { Match, Prediction } from '@/components/MatchWidget'
import LastUpdated from '@/components/ui/LastUpdated'
import RealtimeSettingsListener from '@/components/RealtimeSettingsListener'
import Countdown from '@/components/ui/Countdown'
import { PHASE_SCHEDULE } from '@/constants/phases'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // fetch dati in parallelo
  const [profileRes, rankingRes, matchesRes, predictionRes, settingsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('profiles').select('*').order('total_points', { ascending: false }).limit(5),
    supabase.from('matches').select('*').order('match_time', { ascending: true }),
    supabase.from('predictions').select('*').eq('user_id', user.id),
    supabase.from('app_settings').select('*').single()
  ])

  const profile = profileRes.data
  const rankings = rankingRes.data
  const matches = (matchesRes.data as Match[]) || []
  const predictions = (predictionRes.data as Prediction[]) || []
  const settings = settingsRes.data
  const lastSync = settingsRes.data?.last_sync_at

  // calcolo dei flag temporali
  const now = new Date()
  const openAt = settings ? new Date(settings.voting_open_at) : new Date()
  const closedAt = settings ? new Date(settings.voting_closed_at) : new Date()
  
  const isBlocked = settings ? !settings.is_approved : true
  const isInitial = settings ? (settings.is_approved && now < openAt) : false
  const isOpen = settings ? (settings.is_approved && now >= openAt && now <= closedAt) : false
  const isClosed = settings ? (settings.is_approved && now > closedAt) : false

  const phaseKey = settings?.current_phase as keyof typeof PHASE_SCHEDULE

  // helper grammaticale
  const getPhaseTextWithArticle = (key: keyof typeof PHASE_SCHEDULE, gironiCustomText: string) => {
    if (key == 'GIRONI') return gironiCustomText
    if (key === 'SEDICESIMI') return `i ${PHASE_SCHEDULE.SEDICESIMI.label}`
    if (key === 'OTTAVI') return `gli ${PHASE_SCHEDULE.OTTAVI.label}`
    if (key === 'QUARTI') return `i ${PHASE_SCHEDULE.QUARTI.label}`
    if (key === 'SEMIFINALI') return `le ${PHASE_SCHEDULE.SEMIFINALI.label}`
    if (key === 'FINALE') return `la ${PHASE_SCHEDULE.FINALE.label} e il terzo posto`
    return ''
  }

  // configurazione dinamica del banner fasi
  let bannerConfig = {
    visible: true,
    title: "",
    color: "",
    targetDate: openAt,
    variant: "compact" as const,
    link: "/pronostici"
  }

  if (isBlocked) {
    bannerConfig =  {
      visible: true,
      title: "🛑 Direzione gara al lavoro: mercati temporaneamente sospesi.",
      color: "bg-slate-900 border-slate-800 text-slate-200",
      targetDate: now,
      variant: "compact",
      link: "#"
    }
  } else if (isInitial) {
    // GIALLO
    const targetText = getPhaseTextWithArticle(phaseKey, "I Gironi e le Scommesse Speciali")
    bannerConfig = {
      visible: true,
      title: `⏳ I pronostici per ${targetText} apriranno tra:`,
      color: "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100/50",
      targetDate: openAt,
      variant: "compact",
      link: "/pronostici"
    }
  } else if (isOpen) {
    // VERDE
    const targetText = getPhaseTextWithArticle(phaseKey, "I Gironi e le Scommesse Speciali")
    bannerConfig = {
      visible: true,
      title: `🔥 Corri a inserire i pronostici per ${targetText}, mancano:`,
      color: "bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60 animate-pulse-slow",
      targetDate: closedAt,
      variant: "compact",
      link: phaseKey === 'GIRONI' ? "/side-bets" : "/pronostici"
    }
  } else if (isClosed) {
    // ROSSO
    const phaseData = phaseKey ? PHASE_SCHEDULE[phaseKey] : null
    const nextPhaseDate = phaseData?.nextPhaseOpen

    const phaseKeys = Object.keys(PHASE_SCHEDULE) as (keyof typeof PHASE_SCHEDULE)[]
    const currentIndex = phaseKeys.indexOf(phaseKey)
    const nextPhaseKey = currentIndex !== -1 ? phaseKeys[currentIndex + 1] : null

    const nextPhaseText = nextPhaseKey ? getPhaseTextWithArticle(nextPhaseKey, "I Gironi") : ""

    if (nextPhaseDate) {
      bannerConfig = {
        visible: true,
        title: `🟥 Mercato chiuso! I pronostici per i ${nextPhaseText} apriranno tra:`,
        color: "bg-rose-50 border-rose-200 text-rose-950 hover:bg-rose-100/50",
        targetDate: new Date(nextPhaseDate),
        variant: "compact",
        link: "/pronostici"
      }
    } else {
      bannerConfig.visible = false
    }
  }

  // se l'utente c'è, mostriamo la Dashboard
  return (
    <main className="min-h-screen bg-emerald-50 pb-12">
      <RealtimeSettingsListener />

      {/* header dashboard */}
      <div className="bg-emerald-600 text-white pt-10 pb-16 px-6 rounded-b-[3.5rem] shadow-lg text-center">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter">
          FantaMondiali 2026
        </h1>
        <p className="opacity-80 text-xs font-bold uppercase tracking-widest mt-1">
          Comando centrale
        </p>
      </div>
      
      {/* contenitore principale */}
      <div className="w-full max-w-md sm:max-w-xl mx-auto px-4 -mt-10 space-y-6">

        {/* banner fasi dinamico con countdown compatto */}
        {bannerConfig.visible && (
          <Link
            href={bannerConfig.link}
            className="block transform active:scale-[0.99] transition-all focus:outline-none"
          >
            <div className={`p-3 sm:p-4 rounded-3xl border flex items-center justify-between gap-2 sm:gap-4 shadow-lg backdrop-blur-xs ${bannerConfig.color}`}>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-tight leading-tight text-left break-words">
                  {bannerConfig.title}
                </p>
              </div>
              
              {/* mostro il countdown solo se non è bloccato */}
              {!isBlocked && (
                <div className="shrink-0 bg-white/20 p-1 sm:p-1.5 rounded-xl backdrop-blur-xs">
                  <Countdown
                    targetDate={bannerConfig.targetDate}
                    variant={bannerConfig.variant}
                  />
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Card Punteggio */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 flex justify-between items-center transform transition-transform hover:scale-[1.01]">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Il tuo Punteggio</p>
            <div className="flex items-baseline gap-1">
              <p className="text-5xl font-black text-slate-800">{profile?.total_points || 0}</p>
              <p className="text-slate-400 font-bold text-sm">PT</p>
            </div>
            <p className="text-emerald-600 text-xs font-bold mt-1">
              {profile?.username || 'Bomber'}
            </p>
          </div>
          <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            🏆
          </div>
        </div>

        {/* Widget classifica */}
        <section>
          <RankingWidget users={rankings || []} currentUserId={user.id} />
        </section>

        {/* widget partite */}
        <section className="space-y-3">
          <MatchWidget matches={matches} predictions={predictions} />
          <Link
            href="/pronostici"
            className={`block w-full py-4 rounded-2xl text-center font-black uppercase text-xs shadow-md transition-all active:scale-95 ${
              isOpen 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {isOpen ? 'Inserisci Pronostici 🔥' : 'Guarda i tuoi pronostici ⚽'}
          </Link>
        </section>

        {/* Sezione Admin temporanea */}
        {profile?.role === 'admin' && (
          <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-4 rounded-[2rem]">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black uppercase italic text-sm transition-all shadow-lg shadow-orange-200 active:scale-[0.98]"
            >
              <span className="text-xl">🖥️</span>
              Entra in Sala VAR
            </Link>
          </div>
        )}
      </div>

      {/* footer sincro dati */}
      <LastUpdated date={lastSync} />
    </main>
  )
}