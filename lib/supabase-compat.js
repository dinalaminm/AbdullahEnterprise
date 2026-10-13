/* Firestore-style compat layer on top of Supabase (tables: id text, data jsonb). */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ctyejhcrocbrilnkhewt.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_o8vfbIR7E5lwJSw2hGFkZA_FWjKBEfv';
export const FieldValue = { increment: (n) => ({ __inc: n }) };

export function SupaCompat(){
  if(!SUPABASE_URL||!SUPABASE_KEY)throw new Error('Supabase env not set');
  const sb=createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  const TBL={products:'products',orders:'orders',users:'users',reviews:'reviews',messages:'messages',coupons:'coupons',settings:'settings',admins:'admins'};
  const fail=e=>{const x=new Error(e.message||String(e));x.code=e.code||'supabase/error';return x};
  const mkDoc=r=>({id:r.id,exists:true,data:()=>r.data||{}});
  const mkSnap=rows=>{const docs=(rows||[]).map(mkDoc);return{docs,empty:!docs.length,size:docs.length,forEach:f=>docs.forEach(f)}};
  const rpc=async ops=>{const{error}=await sb.rpc('apply_ops',{ops});if(error)throw fail(error)};
  function subscribe(table,fetcher,cb,errcb){
    let off=false,t;
    const run=async()=>{try{const r=await fetcher();if(!off)cb(r)}catch(e){if(errcb)errcb(e)}};
    run();
    const ch=sb.channel('rt-'+table+'-'+Math.random().toString(36).slice(2)).on('postgres_changes',{event:'*',schema:'public',table},()=>{clearTimeout(t);t=setTimeout(run,150)}).subscribe();
    return()=>{off=true;clearTimeout(t);sb.removeChannel(ch)};
  }
  class Q{
    constructor(col,f=[],lim=null){this.col=col;this.f=f;this.lim=lim}
    where(k,op,v){if(op!=='==')throw new Error('only == supported');return new Q(this.col,[...this.f,[k,String(v)]],this.lim)}
    limit(n){return new Q(this.col,this.f,n)}
    _q(){let q=sb.from(this.col).select('id,data');this.f.forEach(([k,v])=>q=q.eq('data->>'+k,v));if(this.lim)q=q.limit(this.lim);return q}
    async get(){const{data,error}=await this._q();if(error)throw fail(error);return mkSnap(data)}
    onSnapshot(cb,errcb){return subscribe(this.col,()=>this.get(),cb,errcb)}
    doc(id){return new D(this.col,id)}
  }
  class D{
    constructor(col,id){this.col=col;this.id=id}
    async get(){const{data,error}=await sb.from(this.col).select('id,data').eq('id',this.id).maybeSingle();if(error)throw fail(error);return data?mkDoc(data):{id:this.id,exists:false,data:()=>undefined}}
    set(data){return rpc([{op:'set',col:this.col,id:this.id,data}])}
    update(data){return rpc([{op:'update',col:this.col,id:this.id,data}])}
    delete(){return rpc([{op:'delete',col:this.col,id:this.id}])}
    onSnapshot(cb,errcb){return subscribe(this.col,()=>this.get(),cb,errcb)}
  }
  const db={
    collection:n=>{if(!TBL[n])throw new Error('unknown collection '+n);return new Q(TBL[n])},
    batch:()=>{const ops=[];const b={
      set:(r,data)=>(ops.push({op:'set',col:r.col,id:r.id,data}),b),
      update:(r,data)=>(ops.push({op:'update',col:r.col,id:r.id,data}),b),
      delete:r=>(ops.push({op:'delete',col:r.col,id:r.id}),b),
      commit:()=>ops.length?rpc(ops):Promise.resolve()};return b}
  };
  const AC={invalid_credentials:'auth/invalid-credential',invalid_login_credentials:'auth/invalid-credential',over_request_rate_limit:'auth/too-many-requests',email_provider_disabled:'auth/operation-not-allowed',validation_failed:'auth/invalid-email'};
  const aerr=e=>{const x=new Error(e.message);x.code=AC[e.code]||(/fetch|network/i.test(e.message||'')?'auth/network-request-failed':(e.code||'auth/error'));return x};
  const U=s=>s&&s.user?{uid:s.user.id,email:s.user.email}:null;
  const auth={
    async signInWithEmailAndPassword(email,password){const{error}=await sb.auth.signInWithPassword({email,password});if(error)throw aerr(error)},
    onAuthStateChanged(cb){const{data}=sb.auth.onAuthStateChange((_e,s)=>setTimeout(()=>cb(U(s)),0));return()=>data.subscription.unsubscribe()},
    async signOut(){await sb.auth.signOut()},
    async changePassword(email,oldPass,newPass){
      let r=await sb.auth.signInWithPassword({email,password:oldPass});if(r.error)throw aerr(r.error);
      r=await sb.auth.updateUser({password:newPass});if(r.error)throw aerr(r.error)
    }
  };
  return{db,auth,sb};
}
