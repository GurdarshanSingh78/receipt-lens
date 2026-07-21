import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Receipt Lens - Smart Receipt Tracking",
  description: "Upload receipts, extract data instantly, export for taxes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}