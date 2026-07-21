"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptItem {
  merchant: string | null
  date: string | null
  amount: number | null
  category: string | null
}

export default function ExportButton({ receipts }: { receipts: ReceiptItem[] }) {
  const exportCSV = () => {
    const headers = ["Date", "Merchant", "Category", "Amount"]
    const rows = receipts.map((r) => [
      r.date || "",
      r.merchant || "",
      r.category || "",
      r.amount?.toFixed(2) || "0.00",
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipts-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={exportCSV} variant="outline" className="gap-2">
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  )
}
