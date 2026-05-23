import "@/styles/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Voice Assistant",
  description: "Developer voice assistant dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh">
          <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>
        </div>
      </body>
    </html>
  )
}
