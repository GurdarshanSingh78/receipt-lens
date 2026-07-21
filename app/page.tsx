"use client"

import Link from "next/link"
import { ArrowRight, Camera, FileSpreadsheet, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"

export default function HomePage() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Receipt Lens</span>
        </div>
        <div className="flex gap-4">
          {!isSignedIn ? (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Stop losing money on<br />
            <span className="text-blue-600">unclaimed deductions</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10">
            Snap a photo of any receipt. We extract the data instantly. Export a clean CSV for tax time.
          </p>
          {!isSignedIn ? (
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Tracking Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6">
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Snap & Upload</h3>
            <p className="text-slate-600">Drag and drop or snap a photo. Works on any device.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Extraction</h3>
            <p className="text-slate-600">Merchant, date, amount, and category extracted in seconds.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Export to CSV</h3>
            <p className="text-slate-600">One-click export formatted for TurboTax and accountants.</p>
          </div>
        </div>
      </main>
    </div>
  )
}