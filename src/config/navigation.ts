import { SITE } from "./site";

const h = SITE.homeUrl;

export type NavChild = {
  label: string;
  href: string;
  description?: string;
  favicon?: string;
  external?: boolean;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Labs", href: `${h}/labs` },
  { label: "Updates", href: `${h}/updates` },
  { label: "Projects", href: `${h}/projects` },
  { label: "About", href: `${h}/about` },
];

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
