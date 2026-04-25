import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Topbar } from "@/components/features/topbar"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Observatório Público",
  description: "Transparência política baseada em dados oficiais.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg-base text-text-primary antialiased">
        <Topbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-border-default py-4 text-center text-xs text-text-muted">
          Dados: <a href="https://dadosabertos.camara.leg.br" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Câmara dos Deputados</a>
        </footer>
      </body>
    </html>
  )
}
