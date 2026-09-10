'use client'

import { FormEvent,useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui'
import { useSupabase } from '@/lib/supabase/useSupabase'

export default function JoinClassPage(){const supabase=useSupabase();const router=useRouter();const [code,setCode]=useState('');const [loading,setLoading]=useState(false);const [message,setMessage]=useState('')
 async function submit(e:FormEvent){e.preventDefault();if(!code.trim())return;setLoading(true);setMessage('');const {error}=await supabase.rpc('join_class_by_code',{p_code:code.trim()});setLoading(false);if(error)return setMessage(error.message);setMessage('เข้าร่วมห้องเรียนเรียบร้อยแล้ว');window.setTimeout(()=>{router.push('/student/classes');router.refresh()},500)}
 return <div className="space-y-7"><PageHeader eyebrow="Join classroom" title="เข้าร่วมห้องเรียน" description="กรอกรหัส 6 ตัวที่ได้รับจากอาจารย์เพื่อเข้าร่วมห้องเรียน"/><section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><form onSubmit={submit}><label className="block"><span className="mb-2 block text-sm font-black">รหัสเข้าห้อง</span><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={12} placeholder="เช่น ABC123" className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center font-mono text-2xl font-black uppercase tracking-[.25em] outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"/></label><p className="mt-3 text-xs leading-5 text-slate-500">เมื่อเข้าร่วมแล้ว คุณจะเห็นงานและประกาศของห้องนี้ตามสิทธิ์ที่อาจารย์กำหนด</p>{message?<div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm font-bold text-orange-800">{message}</div>:null}<button disabled={loading} className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">{loading?'กำลังเข้าร่วม...':'เข้าร่วมห้องเรียน'}</button></form></section></div>}
