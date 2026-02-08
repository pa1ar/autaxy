const BASE = "https://1ar.io";

export const NAV_ITEMS = [
  { label: "Labs", href: `${BASE}/labs` },
  { label: "Updates", href: `${BASE}/updates` },
  { label: "Projects", href: `${BASE}/projects` },
  { label: "About", href: `${BASE}/about` },
] as const;

export const FOOTER_LINKS = {
  quickLinks: [
    { label: "Labs", href: `${BASE}/labs` },
    { label: "Updates", href: `${BASE}/updates` },
    { label: "Projects", href: `${BASE}/projects` },
    { label: "About", href: `${BASE}/about` },
  ],
  legal: [
    { label: "Privacy Policy", href: `${BASE}/privacy` },
    { label: "Terms of Service", href: `${BASE}/terms` },
  ],
} as const;
