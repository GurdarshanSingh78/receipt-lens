import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import ReceiptUploader from "@/components/ReceiptUploader"
import ReceiptList from "@/components/ReceiptList"
import ExportButton from "@/components/ExportButton"
import { UserButton } from "@clerk/nextjs"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-up")

  const { data: receipts } = await supabase
    .from("receipts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Receipt Lens</h1>
          <UserButton  />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Receipts</h2>
          <p className="text-slate-600">{receipts?.length || 0} receipts tracked</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ReceiptUploader />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-end">
              <ExportButton receipts={receipts || []} />
            </div>
            <ReceiptList receipts={receipts || []} />
          </div>
        </div>
      </main>
    </div>
  )
}