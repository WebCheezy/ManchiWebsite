import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Instagram } from "lucide-react"

const LOCATIONS = [
  {
    label: "Enugu — Chasemall",
    lines: ["33, Abakaliki Road by 38 Bus Stop, GRA, Enugu, Enugu State."],
  },
  {
    label: "Port Harcourt — Eromo",
    lines: ["Opposite Eromo Filling Station, New Road Eneka Atali Road, Rivers State."],
  },
] as const

export function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-foreground">
      <div className="px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-3">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image
                src="/logos/manchi-primary-dark-mode.png"
                alt="Manchi"
                width={120}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm text-footer-foreground/70 leading-relaxed max-w-xs">
              Delicious Nigerian food delivered fast to your door from our multiple locations.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://www.instagram.com/manchi_takeout/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-footer-foreground/60 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-footer-foreground mb-4 text-sm uppercase tracking-wide">
              Quick links
            </h3>
            <nav className="flex flex-col gap-2.5">
              <Link href="/menu" className="text-sm text-footer-foreground/70 hover:text-primary transition-colors">
                Our menu
              </Link>
              <Link href="/#popular" className="text-sm text-footer-foreground/70 hover:text-primary transition-colors">
                Popular dishes
              </Link>
              <Link href="/terms" className="text-sm text-footer-foreground/70 hover:text-primary transition-colors">
                Terms &amp; conditions
              </Link>
              <Link href="/privacy" className="text-sm text-footer-foreground/70 hover:text-primary transition-colors">
                Privacy policy
              </Link>
            </nav>
          </div>

          {/* Download App */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-footer-foreground mb-4 text-sm uppercase tracking-wide">
              Download the app
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-footer-foreground/10 hover:bg-footer-foreground/15 transition-colors rounded-lg px-4 py-2.5 w-full sm:w-fit max-w-xs"
              >
                <svg className="h-7 w-7 shrink-0 text-footer-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.97 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.89C10.1 6.87 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[10px] text-footer-foreground/60 leading-none">Download on the</span>
                  <span className="text-sm font-semibold text-footer-foreground leading-tight">App Store</span>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-footer-foreground/10 hover:bg-footer-foreground/15 transition-colors rounded-lg px-4 py-2.5 w-full sm:w-fit max-w-xs"
              >
                <svg className="h-7 w-7 shrink-0 text-footer-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[10px] text-footer-foreground/60 leading-none">GET IT ON</span>
                  <span className="text-sm font-semibold text-footer-foreground leading-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Contact & locations */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h3 className="font-semibold text-footer-foreground mb-4 text-sm uppercase tracking-wide">
              Contact &amp; locations
            </h3>
            <div className="flex flex-col gap-4">
              <a
                href="mailto:hi@manchi.ng"
                className="flex items-center gap-2.5 text-sm text-footer-foreground/70 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0 text-footer-foreground/50" />
                hi@manchi.ng
              </a>
              <a
                href="tel:+2347072452303"
                className="flex items-center gap-2.5 text-sm text-footer-foreground/70 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0 text-footer-foreground/50" />
                07072452303
              </a>

              <div className="mt-1 grid gap-4 sm:grid-cols-1">
                {LOCATIONS.map((loc) => (
                  <div key={loc.label} className="flex gap-3 rounded-xl bg-footer-foreground/[0.06] p-3.5">
                    <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-footer-foreground tracking-wide">{loc.label}</p>
                      {loc.lines.map((line, i) => (
                        <p key={`${loc.label}-${i}`} className="mt-1 text-xs text-footer-foreground/65 leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-footer-foreground/10">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-footer-foreground/50 text-center sm:text-left">
            {"\u00A9"} 2026 Manchi. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <Link href="/terms" className="text-footer-foreground/50 hover:text-footer-foreground/80 transition-colors">
              Terms
            </Link>
            <span className="text-footer-foreground/25" aria-hidden>
              ·
            </span>
            <Link href="/privacy" className="text-footer-foreground/50 hover:text-footer-foreground/80 transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
