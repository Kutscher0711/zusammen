import { useEffect, useState } from 'react'
import { supabase, configured } from './supabase'
import Icon from './Icon'
import Einkauf from './tabs/Einkauf'
import Termine from './tabs/Termine'
import Todos from './tabs/Todos'
import Essen from './tabs/Essen'
import Dates from './tabs/Dates'
import Stuttgart from './tabs/Stuttgart'

const TABS = [
  { id: 'einkauf', label: 'Liste', icon: 'cart', comp: Einkauf },
  { id: 'termine', label: 'Termine', icon: 'calendar', comp: Termine },
  { id: 'todos', label: 'To Dos', icon: 'check', comp: Todos },
  { id: 'essen', label: 'Essen', icon: 'meal', comp: Essen },
  { id: 'dates', label: 'Dates', icon: 'heart', comp: Dates },
  { id: 'stuttgart', label: 'Stuttgart', icon: 'city', comp: Stuttgart }
]

const SWATCHES = ['#0F766E', '#E4566E', '#4F46E5', '#D97706', '#DB2777', '#16A34A']

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    setErr('')
    const fn =
      mode === 'login'
        ? supabase.auth.signInWithPassword({ email, password: pw })
        : supabase.auth.signUp({ email, password: pw })
    const { error } = await fn
    if (error) setErr(error.message)
    setBusy(false)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">Zusammen</div>
      <div className="auth-claim">Unser gemeinsamer Alltag an einem Ort</div>
      <input
        type="email"
        placeholder="E Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Passwort"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
      />
      {err && <div className="error-text">{err}</div>}
      <button className="btn btn-wide" disabled={busy || !email || !pw} onClick={submit}>
        {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
      </button>
      <button
        className="auth-toggle"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? 'Noch kein Konto? Hier registrieren' : 'Schon ein Konto? Hier anmelden'}
      </button>
    </div>
  )
}

function ProfileSetup({ user, onDone }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(SWATCHES[0])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function save() {
    setBusy(true)
    const { error } = await supabase
      .from('profiles')
      .insert({ id: user.id, name: name.trim(), color })
    if (error) {
      setErr(error.message)
      setBusy(false)
    } else {
      onDone()
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">Fast geschafft</div>
      <div className="auth-claim">Wie heißt du und welche Farbe bekommst du in der App?</div>
      <input placeholder="Dein Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="swatch-row">
        {SWATCHES.map((c) => (
          <button
            key={c}
            className={`swatch ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={`Farbe ${c}`}
          />
        ))}
      </div>
      {err && <div className="error-text">{err}</div>}
      <button className="btn btn-wide" disabled={busy || !name.trim()} onClick={save}>
        Los gehts
      </button>
    </div>
  )
}

function ConfigMissing() {
  return (
    <div className="auth-wrap">
      <div className="auth-logo">Zusammen</div>
      <div className="auth-claim">
        Die Verbindung zur Datenbank fehlt noch. Lege eine Datei .env mit VITE_SUPABASE_URL und
        VITE_SUPABASE_ANON_KEY an. Die Anleitung steht in der README.
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [tab, setTab] = useState('einkauf')

  useEffect(() => {
    if (!configured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function loadProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setProfiles(data || [])
    setProfileLoaded(true)
  }

  useEffect(() => {
    if (!session) return
    loadProfiles()
    const channel = supabase
      .channel('rt-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadProfiles)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [session])

  if (!configured) return <ConfigMissing />
  if (!ready) return null
  if (!session) return <AuthScreen />
  if (!profileLoaded) return null

  const me = profiles.find((p) => p.id === session.user.id)
  if (!me) return <ProfileSetup user={session.user} onDone={loadProfiles} />

  const ActiveTab = TABS.find((t) => t.id === tab).comp

  return (
    <>
      <header className="app-header">
        <h1>Zusammen</h1>
        <div className="header-avatars">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="avatar"
              style={{ background: p.color }}
              title={p.name}
              onClick={() => {
                if (p.id === me.id && window.confirm('Abmelden?')) supabase.auth.signOut()
              }}
            >
              {p.name.slice(0, 1).toUpperCase()}
            </div>
          ))}
        </div>
      </header>
      <main className="tab-content">
        <ActiveTab me={me} profiles={profiles} />
      </main>
      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} />
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}
