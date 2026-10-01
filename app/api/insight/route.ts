import { NextRequest, NextResponse } from "next/server";
import { buildInsightContext } from "@/lib/insight-context";
import { hasDatabaseUrl } from "@/lib/db";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;
const requests = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "anonymous";
}

function rateLimited(key: string) {
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  requests.set(key, current);
  return current.count > MAX_REQUESTS;
}

function cleanHistory(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(-6).flatMap(item => {
    if (!item || typeof item !== "object") return [];
    const role = (item as { role?: unknown }).role;
    const text = (item as { text?: unknown }).text;
    if ((role !== "user" && role !== "assistant") || typeof text !== "string") return [];
    return [{ role, text: text.slice(0, 1200) }];
  });
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.GEMINI_API_KEY),
    databaseConfigured: hasDatabaseUrl(),
    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  });
}

export async function POST(request: NextRequest) {
  const key = clientKey(request);
  if (rateLimited(key)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi beberapa menit." },
      { status: 429 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "NADI Insight belum terhubung ke Gemini pada environment ini." },
      { status: 503 },
    );
  }

  let body: { question?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 1200) {
    return NextResponse.json(
      { error: "Pertanyaan harus berisi 1–1200 karakter." },
      { status: 400 },
    );
  }

  const history = cleanHistory(body.history);
  const context = await buildInsightContext();
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  const systemInstruction = `Anda adalah NADI Insight, analis data internal untuk prototype Monitoring, Evaluation & Learning ketahanan pangan Sulawesi Tengah.

ATURAN WAJIB:
1. Jawab dalam Bahasa Indonesia yang ringkas, jelas, dan profesional.
2. Gunakan HANYA data dalam DATA_CONTEXT untuk klaim faktual tentang dashboard. Jangan mengarang angka, program, lokasi, outcome, atau sumber.
3. Bedakan tegas sumber: [S1] IKP resmi Bapanas, [S2] PoU resmi BPS, [S3] registry intervensi pilot (periksa field simulation), [S4] alert rule engine, [S5] learning, [S6] batas spasial BIG.
4. Setiap klaim data penting harus diberi sitasi sumber dengan format [S1] sampai [S6] sesuai konteks. Jangan menyebut data simulasi sebagai fakta lapangan.
5. Bila data tidak cukup, katakan "Data yang tersedia belum cukup" dan sebutkan apa yang belum ada.
6. Jangan menetapkan prioritas politik, memberi ranking kebijakan, menentukan alokasi anggaran, atau membuat keputusan atas nama pemerintah. Boleh menjelaskan indikator, gap, status monitoring, pola data, dan kebutuhan review manusia.
7. Jangan mengklaim bahwa aplikasi menyebabkan penurunan kerawanan pangan.
8. Jangan menulis substansi policy brief kompetisi, rekomendasi kebijakan final, atau kesimpulan kompetisi. Fokus pada pembacaan data dashboard dan dukungan MEL.
9. Anggap beneficiary/intervention/learning yang berlabel simulation sebagai DEMO, bukan data resmi lapangan.
10. Untuk PoU, jangan mengarang angka kabupaten/kota jika konteks hanya menyediakan agregat Provinsi Sulawesi Tengah 2025. Jelaskan tingkat kedalaman datanya.
11. Jika user meminta tindakan perubahan data, jelaskan bahwa NADI Insight saat ini read-only.
12. IKP 2026 dalam konteks berasal dari dataset resmi Bapanas 12 indikator. Gunakan kelas komposit yang tersedia, bukan membuat kelas sendiri.
13. Bila user menanyakan peta/batas wilayah, [S6] adalah sumber geospasial; jangan mengubah indikator menjadi koordinat atau sebaliknya.

Gaya jawaban:
- maksimal sekitar 350 kata kecuali user meminta detail;
- mulai dengan jawaban langsung;
- gunakan bullet hanya bila membantu;
- akhiri dengan "Sumber data:" lalu daftar kode sumber yang benar-benar digunakan.`;

  const userPrompt = `DATA_CONTEXT:
${JSON.stringify(context)}

RIWAYAT PERCAKAPAN TERBATAS:
${JSON.stringify(history)}

PERTANYAAN USER:
${question}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 900,
            thinkingConfig: { thinkingLevel: "low" },
          },
        }),
        signal: AbortSignal.timeout(25_000),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "Gemini tidak dapat memproses permintaan.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Gemini tidak mengembalikan jawaban teks." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      answer,
      model,
      contextMode: context.mode,
      sources: context.sources,
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "Gemini membutuhkan waktu terlalu lama. Coba lagi."
      : "NADI Insight sedang tidak tersedia. Coba lagi sebentar.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
