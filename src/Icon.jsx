const paths = {
  cart: (
    <>
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.47 1.18h7.6a1.5 1.5 0 0 0 1.46-1.14L20 8H6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  check: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12.2l2.8 2.8L16.5 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  meal: (
    <>
      <path d="M7 3v7M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3M7 10v11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 3c-1.8 0-3 2.6-3 6 0 2 .8 3 2 3v9M15.5 12h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  heart: (
    <path d="M12 20.5s-7.6-4.7-9.3-9.3C1.5 8 3.5 4.8 6.8 4.8c2 0 3.7 1.1 5.2 3.1 1.5-2 3.2-3.1 5.2-3.1 3.3 0 5.3 3.2 4.1 6.4C19.6 15.8 12 20.5 12 20.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  city: (
    <>
      <path d="M4 20.5V9l5-3v14.5M9 20.5V12l6-2.5v11M15 20.5V13l5 1.5v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M2.5 20.5h19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
}

export default function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
