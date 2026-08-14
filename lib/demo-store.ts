'use client';
import { Demand } from './types';
import { demoDemand } from './demo-data';

const KEY='hairmatch_demands_v1';
export function loadDemands(): Demand[] {
  if (typeof window==='undefined') return [demoDemand];
  try { const raw=localStorage.getItem(KEY); return raw ? JSON.parse(raw) : [demoDemand]; } catch { return [demoDemand]; }
}
export function saveDemand(demand: Demand) {
  const items=loadDemands();
  const next=[demand, ...items.filter(x=>x.id!==demand.id)];
  localStorage.setItem(KEY, JSON.stringify(next));
}
export function ensureDemo(){ if(typeof window!=='undefined' && !localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify([demoDemand])); }
