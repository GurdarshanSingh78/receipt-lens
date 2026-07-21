"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Receipt, Pencil, Check, X, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ReceiptItem {
  id: string
  merchant: string | null
  date: string | null
  amount: number | null
  category: string | null
  image_url: string
  created_at: string
}

export default function ReceiptList({ receipts }: { receipts: ReceiptItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ merchant: "", date: "", amount: "", category: "" })
  const router = useRouter()
  const { getToken } = useAuth()

  const startEdit = (r: ReceiptItem) => {
    setEditingId(r.id)
    setEditForm({
      merchant: r.merchant || "",
      date: r.date || "",
      amount: r.amount?.toString() || "",
      category: r.category || "",
    })
  }

  const { userId } = useAuth()

  const saveEdit = async (id: string) => {
    await fetch("/api/extract", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId || "",
      },
      body: JSON.stringify({ id, ...editForm, amount: parseFloat(editForm.amount) || 0 }),
    })
    setEditingId(null)
    router.refresh()
  }

  const deleteReceipt = async (id: string) => {
    await fetch(`/api/extract?id=${id}`, {
      method: "DELETE",
      headers: {
        "x-user-id": userId || "",
      },
    })
    router.refresh()
  }

  const categories: Record<string, string> = {
    Meals: "bg-orange-100 text-orange-700",
    "Office Supplies": "bg-blue-100 text-blue-700",
    Travel: "bg-green-100 text-green-700",
    Utilities: "bg-purple-100 text-purple-700",
    Uncategorized: "bg-slate-100 text-slate-700",
  }

  if (receipts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No receipts yet. Upload your first one!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {receipts.map((r) => (
        <Card key={r.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="w-24 h-24 bg-slate-100 flex-shrink-0">
                <img src={r.image_url} alt="Receipt" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-4 min-w-0">
                {editingId === r.id ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={editForm.merchant} onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })} placeholder="Merchant" className="h-8 text-sm" />
                    <Input value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} placeholder="Date" className="h-8 text-sm" />
                    <Input value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} placeholder="Amount" className="h-8 text-sm" type="number" step="0.01" />
                    <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} placeholder="Category" className="h-8 text-sm" />
                    <div className="col-span-2 flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(r.id)} className="h-7"><Check className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7"><X className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">{r.merchant || "Unknown Merchant"}</h3>
                        <Badge className={categories[r.category || "Uncategorized"] || categories.Uncategorized}>{r.category || "Uncategorized"}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">{r.date || "No date"}</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">${r.amount?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(r)} className="h-8 w-8 p-0">
                        <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteReceipt(r.id)} className="h-8 w-8 p-0">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
