import type { AlertItem, Intervention, Region } from "./types";

export const regions: Region[] = [
  { id:"r-bangkep", slug:"banggai-kepulauan", name:"Banggai Kepulauan", type:"Kabupaten", ikp:66.5, pou:15.86, risk:"critical", interventions:3, pendingEvaluations:2, coverageGap:false, lastUpdated:"24 Sep 2026", x:78, y:59, notes:"Wilayah kepulauan dengan PoU tertinggi di antara wilayah pilot." },
  { id:"r-balut", slug:"banggai-laut", name:"Banggai Laut", type:"Kabupaten", ikp:51.91, pou:12.89, risk:"critical", interventions:2, pendingEvaluations:1, coverageGap:false, lastUpdated:"23 Sep 2026", x:88, y:70, notes:"IKP terendah pada dataset pilot; konteks kepulauan memerlukan pemantauan lintas siklus." },
  { id:"r-donggala", slug:"donggala", name:"Donggala", type:"Kabupaten", ikp:73.97, pou:13.49, risk:"high", interventions:2, pendingEvaluations:0, coverageGap:true, lastUpdated:"22 Sep 2026", x:30, y:35, notes:"Pilot untuk membandingkan wilayah pesisir/daratan dan variasi pola intervensi." },
  { id:"r-sigi", slug:"sigi", name:"Sigi", type:"Kabupaten", ikp:80.06, pou:13.48, risk:"high", interventions:1, pendingEvaluations:1, coverageGap:false, lastUpdated:"24 Sep 2026", x:37, y:53, notes:"IKP relatif tinggi tetapi PoU pilot masih tinggi, berguna untuk membaca indikator secara multidimensi." },
  { id:"r-palu", slug:"palu", name:"Palu", type:"Kota", ikp:82.43, pou:5.72, risk:"stable", interventions:1, pendingEvaluations:0, coverageGap:false, lastUpdated:"25 Sep 2026", x:38, y:41, notes:"Wilayah pembanding dengan kondisi agregat relatif lebih baik." }
];

export const interventions: Intervention[] = [
  { id:"INT-026", title:"Penguatan Akses Pangan Wilayah Kepulauan", type:"Cadangan Pangan", region:"Banggai Kepulauan", location:"Pilot Area A", agency:"Dinas Pangan", collaborators:["OPD Mitra"], status:"awaiting_evaluation", beneficiariesTarget:420, beneficiariesActual:398, startedAt:"12 Aug 2026", endedAt:"28 Aug 2026", evaluationDue:"27 Sep 2026", simulation:true, objective:"Menguji pelacakan intervensi dari kerentanan hingga tindak lanjut." },
  { id:"INT-021", title:"Stabilisasi Akses Pangan Pilot", type:"Gerakan Pangan Murah", region:"Banggai Laut", location:"Pilot Area B", agency:"Dinas Pangan", collaborators:["Perdagangan"], status:"active", beneficiariesTarget:300, beneficiariesActual:244, startedAt:"07 Sep 2026", simulation:true, objective:"Memantau coverage dan follow-up intervensi stabilisasi akses pangan." },
  { id:"INT-017", title:"Intervensi Kewaspadaan Pangan & Gizi", type:"Kewaspadaan Pangan", region:"Sigi", location:"Pilot Area C", agency:"Dinas Pangan", collaborators:["Dinas Kesehatan"], status:"awaiting_evaluation", beneficiariesTarget:220, beneficiariesActual:213, startedAt:"03 Jul 2026", endedAt:"21 Jul 2026", evaluationDue:"20 Aug 2026", simulation:true, objective:"Menguji evaluasi lintas indikator pada wilayah daratan." },
  { id:"INT-012", title:"Penguatan Ketahanan Pangan Keluarga", type:"Pemberdayaan", region:"Donggala", location:"Pilot Area D", agency:"Dinas Pangan", collaborators:["Kabupaten/Kota"], status:"evaluated", beneficiariesTarget:180, beneficiariesActual:176, startedAt:"09 Mar 2026", endedAt:"12 Apr 2026", simulation:true, objective:"Menguji penutupan siklus baseline, follow-up, outcome, dan learning." }
];

export const alerts: AlertItem[] = [
  { id:"A-01", kind:"coverage", severity:"critical", title:"Coverage gap terdeteksi", subtitle:"Wilayah prioritas belum memiliki intervensi aktif pada subset indikator yang dipantau.", region:"Donggala", age:"2 jam" },
  { id:"A-02", kind:"evaluation", severity:"warning", title:"Evaluasi melewati jadwal", subtitle:"Follow-up outcome belum dicatat setelah intervensi selesai.", region:"Sigi", age:"18 hari" },
  { id:"A-03", kind:"evaluation", severity:"warning", title:"Outcome belum diverifikasi", subtitle:"Intervensi selesai dan menunggu evaluasi evaluator M&E.", region:"Banggai Kepulauan", age:"4 hari" },
  { id:"A-04", kind:"persistent", severity:"info", title:"Perlu review kerentanan persisten", subtitle:"Beberapa siklus intervensi membutuhkan pembacaan ulang indikator dan konteks.", region:"Banggai Laut", age:"1 hari" }
];

export const learningCards = [
  { title:"Intervensi harus ditautkan ke indikator awal", region:"Donggala", tag:"Traceability", body:"Catatan simulasi menunjukkan evaluasi menjadi jauh lebih mudah ketika setiap intervensi memiliki baseline yang eksplisit dan sumber data yang sama." },
  { title:"Follow-up perlu dijadwalkan sejak awal", region:"Sigi", tag:"Evaluation", body:"Jadwal evaluasi yang dibuat saat intervensi dimulai mengurangi risiko outcome terlambat dicatat." },
  { title:"Karakter kepulauan perlu dibaca terpisah", region:"Banggai Laut", tag:"Context", body:"Data agregat perlu disertai konteks akses dan distribusi agar interpretasi tidak berhenti pada skor komposit." }
];
