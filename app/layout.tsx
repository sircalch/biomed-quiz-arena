import type { Metadata } from "next";
import { BarChart3, ExternalLink, ListChecks, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BioMed Quiz Arena",
  description:
    "Modulo academico de quizzes para ingenieria biomedica, tecnologia medica y evidencia educativa.",
};

const DONATION_URL = process.env.NEXT_PUBLIC_DONATION_URL ?? "";
const CORE_URL =
  process.env.NEXT_PUBLIC_CORE_URL ?? "https://biomedtools-mx-core.vercel.app";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-40 border-b border-blue-900 bg-blue-950/95 text-white shadow-sm backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/10 text-cyan-100">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
                  BioMedTools MX Core
                </p>
                <Link href="/" className="text-xl font-semibold text-white">
                  BioMed Quiz Arena
                </Link>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a
                href={CORE_URL}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-medium text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Core
              </a>
              <Link
                href="/categories"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-medium text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Categorias
              </Link>
              <Link
                href="/result"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-medium text-blue-100 hover:bg-white/10 hover:text-white"
              >
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                Resultado
              </Link>
              <Link
                href="/categories"
                className="inline-flex min-h-9 items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-blue-950 transition hover:bg-blue-50"
              >
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Practicar
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-blue-900 bg-blue-950 text-white">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.35fr_1fr_auto] md:px-6">
            <div className="flex items-center gap-4">
              <Image
                src="/topic-tales-biomedica-logo.png"
                alt="Topic Tales Biomedica"
                width={126}
                height={89}
                className="h-14 w-auto rounded-md bg-white p-1.5 object-contain"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
                  Topic Tales Biomedica
                </p>
                <p className="text-sm font-semibold text-white">
                  Ing. Andres Monreal
                </p>
                <p className="max-w-sm text-xs leading-5 text-blue-200">
                  Ingeniero Biomedico / Topic Tales Biomedica
                </p>
              </div>
            </div>
            <div className="text-xs leading-5 text-blue-200">
              <p className="font-semibold uppercase tracking-wide text-cyan-100">
                Modulo academico
              </p>
              <p>
                Repaso por categoria, pretest/postest y competencia academica
                para tecnologia medica e ingenieria biomedica.
              </p>
            </div>
            {DONATION_URL ? (
              <div className="rounded-md border border-white/15 bg-white/10 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-100">
                  Apoya el proyecto
                </p>
                <a
                  href={DONATION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-8 items-center justify-center rounded-md bg-white px-3 py-1 text-xs font-semibold text-blue-950 transition hover:bg-blue-50"
                >
                  Donar con PayPal
                </a>
              </div>
            ) : null}
          </div>
        </footer>
      </body>
    </html>
  );
}
