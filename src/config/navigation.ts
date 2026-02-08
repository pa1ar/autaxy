import { SITE } from "./site";

const h = SITE.homeUrl;

export const NAV_ITEMS = [
  { label: "Labs", href: `${h}/labs` },
  { label: "Updates", href: `${h}/updates` },
  { label: "Projects", href: `${h}/projects` },
  { label: "About", href: `${h}/about` },
] as const;

export const FOOTER_LINKS = {
  quickLinks: [
    { label: "Labs", href: `${h}/labs` },
    { label: "Updates", href: `${h}/updates` },
    { label: "Projects", href: `${h}/projects` },
    { label: "About", href: `${h}/about` },
  ],
  legal: [
    { label: "Privacy Policy", href: `${h}/privacy` },
    { label: "Terms of Service", href: `${h}/terms` },
  ],
} as const;
