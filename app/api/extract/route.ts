import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const userId = request.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString("base64")

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(`${userId}/${Date.now()}-${file.name}`, buffer, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(uploadData.path)
  const imageUrl = urlData.publicUrl

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "pixtral-12b-latest",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract from this receipt: merchant name, date (YYYY-MM-DD), total amount (number only), category (Meals, Office Supplies, Travel, Utilities, or Uncategorized). Return ONLY a JSON object with keys: merchant, date, amount, category.",
              },
              {
                type: "image_url",
                image_url: `data:${file.type};base64,${base64}`,
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Mistral API error" }, { status: 500 })
    }

    const content = data.choices[0].message.content || "{}"
    let extracted
    try {
      const clean = content.replace(/```json\s?/g, "").replace(/```/g, "").trim()
      extracted = JSON.parse(clean)
    } catch {
      extracted = { merchant: null, date: null, amount: null, category: "Uncategorized" }
    }

    const { data: receipt, error } = await supabase
      .from("receipts")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        merchant: extracted.merchant,
        date: extracted.date,
        amount: extracted.amount,
        category: extracted.category || "Uncategorized",
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(receipt)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "AI extraction failed" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const userId = request.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { id, merchant, date, amount, category } = body

  const { error } = await supabase
    .from("receipts")
    .update({ merchant, date, amount, category })
    .eq("id", id)
    .eq("user_id", userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const userId = request.headers.get("x-user-id")
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 })

  const { error } = await supabase.from("receipts").delete().eq("id", id).eq("user_id", userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
