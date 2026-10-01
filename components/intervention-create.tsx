"use client";

import { FormEvent, useState } from "react";
import { Plus, Save, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function InterventionCreate({regions,compact=false}:{regions:Array<{slug:string;name:string}>;compact?:boolean}){
  const [open,setOpen]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setSaving(true);setError("");
    const form=new FormData(event.currentTarget);
    const body=Object.fromEntries(form.entries());
    try{
      const response=await fetch("/api/interventions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Gagal menyimpan intervensi.");
      setOpen(false);
      router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Gagal menyimpan.");}
    finally{setSaving(false);}
  }

  return <>
    <button type="button" className={compact?"mobile-add-action":"primary-button"} onClick={()=>setOpen(true)}>
      <Plus size={17}/><span>{compact?"Tambah":"New intervention"}</span>
    </button>
    {open&&<div className="modal-backdrop" onClick={()=>setOpen(false)}>
      <form className="nadi-modal intervention-form" onSubmit={submit} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><span className="eyebrow">PILOT WRITE WORKSPACE</span><h2>Tambah intervensi</h2><p>Record baru selalu disimpan sebagai <b>SIMULATION</b> sampai diverifikasi melalui workflow resmi.</p></div>
          <button type="button" className="icon-button" onClick={()=>setOpen(false)} aria-label="Tutup"><X size={18}/></button>
        </div>
        <div className="simulation-banner"><ShieldCheck size={16}/><span>Safe pilot mode · tidak akan diklaim sebagai data resmi.</span></div>
        <div className="form-grid">
          <label className="field full"><span>Judul intervensi</span><input name="title" required maxLength={160} placeholder="Contoh: Penguatan akses pangan desa pilot"/></label>
          <label className="field"><span>Jenis</span><select name="type" required defaultValue=""><option value="" disabled>Pilih jenis</option><option>Cadangan Pangan</option><option>Gerakan Pangan Murah</option><option>Kewaspadaan Pangan</option><option>Pemberdayaan</option><option>Distribusi Pangan</option><option>Lainnya</option></select></label>
          <label className="field"><span>Wilayah</span><select name="regionSlug" required defaultValue=""><option value="" disabled>Pilih wilayah</option>{regions.map(r=><option key={r.slug} value={r.slug}>{r.name}</option>)}</select></label>
          <label className="field"><span>Lokasi detail</span><input name="location" placeholder="Kecamatan/desa/pilot area"/></label>
          <label className="field"><span>Instansi</span><input name="agency" defaultValue="Dinas Pangan"/></label>
          <label className="field"><span>Target penerima</span><input name="beneficiariesTarget" type="number" min="0" defaultValue="0"/></label>
          <label className="field"><span>Realisasi penerima</span><input name="beneficiariesActual" type="number" min="0" defaultValue="0"/></label>
          <label className="field"><span>Tanggal mulai</span><input name="startedAt" type="date"/></label>
          <label className="field"><span>Target evaluasi</span><input name="evaluationDue" type="date"/></label>
          <label className="field full"><span>Tujuan / konteks</span><textarea name="objective" rows={3} maxLength={600} placeholder="Apa yang ingin dipantau dan diukur?"/></label>
        </div>
        {error&&<div className="form-error">{error}</div>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Batal</button><button className="primary-button" disabled={saving}><Save size={16}/>{saving?"Menyimpan...":"Simpan simulasi"}</button></div>
      </form>
    </div>}
  </>;
}
