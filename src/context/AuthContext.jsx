import { createContext, useContext, useState, useEffect } from 'react';
import { portalFetch } from '../lib/supabase';
const AuthContext=createContext(null);
// eslint-disable-next-line react-refresh/only-export-components -- Preserve the existing shared auth hook API.
export const useAuth=()=>{const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be inside AuthProvider');return value;};
export function AuthProvider({children}){
  const [user,setUser]=useState(null);const [loading,setLoading]=useState(true);const [sessionError,setSessionError]=useState('');
  useEffect(()=>{
    let active=true;
    try{localStorage.removeItem('portal_user');}catch{/* Stored identity is never trusted. */}
    (async()=>{try{const r=await portalFetch('/api/auth/session');if(r.ok){const current=await r.json();if(active)setUser(current);}else if(r.status!==401&&active)setSessionError('Team access is temporarily unavailable.');}catch{if(active)setSessionError('Team access is temporarily unavailable.');}finally{if(active)setLoading(false);}})();
    return()=>{active=false;};
  },[]);
  async function login(email,password,rememberDevice=false){
    try{const r=await portalFetch('/api/auth/login',{method:'POST',body:JSON.stringify({email,password,rememberDevice})});const body=await r.json();if(!r.ok)return{success:false,error:body.error||'Sign-in unavailable.'};setUser(body);setSessionError('');return{success:true};}catch{return{success:false,error:'Sign-in unavailable. Please retry; no browser password lookup was attempted.'};}
  }
  async function logout(){
    try{const r=await portalFetch('/api/auth/logout',{method:'POST',body:'{}'});if(!r.ok)throw new Error();setUser(null);setSessionError('');return true;}catch{setSessionError('Sign-out could not be confirmed. Please retry.');return false;}
  }
  return <AuthContext.Provider value={{user,loading,sessionError,login,logout,isAuthenticated:user?.role==='admin'}}>{children}</AuthContext.Provider>;
}
