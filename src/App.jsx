/**
 * ============================================================
 *  Maxileeyam — Cellphone Parts & Accessories
 *  Firebase-Connected Inventory System
 * ============================================================
 *  npm install lucide-react firebase
 *  Update firebaseConfig below, then: npm run dev
 * ============================================================
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  X, Plus, Search, Pencil, Trash2, Check, AlertCircle,
  CheckCircle, Info, Package, ShoppingCart,
  History, ChevronDown, Minus, Wifi, WifiOff,
  TrendingDown, ArrowDown, Gift, Smartphone, Loader2,
  BarChart3, Tag, AlertTriangle,
} from "lucide-react";

// Firebase imports
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy, Timestamp,
} from "firebase/firestore";

// ─────────────────────────────────────────────
//  FIREBASE CONFIG — update with your own
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBFjNzywyq6C-MjgBIFJLCr-tT73LDTDVU",
  authDomain: "cpinventory-8b833.firebaseapp.com",
  projectId: "cpinventory-8b833",
  storageBucket: "cpinventory-8b833.firebasestorage.app",
  messagingSenderId: "6897849274",
  appId: "1:6897849274:web:027455691a9b6e197c0383",
  measurementId: "G-FXEC1H10QP",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const stockStatus = (item) => {
  if (item.qty === 0) return "out";
  if (item.qty <= item.low) return "low";
  return "in";
};
const STOCK_LABELS = { in: "In Stock", low: "Low Stock", out: "Out of Stock" };
const fmt = (n) => Number(n || 0).toLocaleString();
const fmtDate = (ts) => {
  if (!ts) return "—";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ─────────────────────────────────────────────
//  CSS — Clean Sidebar Layout, Tablet-First
// ─────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root {
  --ink:#0D0F1A;
  --ink2:#3A3D52;
  --ink3:#8890B0;
  --ink4:#BEC4D8;
  --bg:#F4F5FB;
  --surf:#FFFFFF;
  --surf2:#F8F9FD;
  --surf3:#EEF0FA;
  --bdr:rgba(100,110,180,.12);
  --bdr2:rgba(100,110,180,.22);

  --blue:#3D6FFF;
  --blue-lt:#EBF0FF;
  --blue-dk:#1E42CC;
  --green:#00B87A;
  --green-lt:#E0FBF2;
  --green-dk:#006E49;
  --amber:#F59E0B;
  --amber-lt:#FEF3C7;
  --amber-dk:#92400E;
  --red:#EF4444;
  --red-lt:#FEE2E2;
  --red-dk:#991B1B;
  --purple:#8B5CF6;
  --purple-lt:#EDE9FE;
  --purple-dk:#4C1D95;

  --accent:#3D6FFF;
  --accent2:#8B5CF6;

  --rad:10px;
  --rad-lg:14px;
  --rad-xl:20px;
  --sh:0 1px 4px rgba(13,15,26,.06),0 0 0 1px rgba(100,110,180,.08);
  --sh-md:0 4px 16px rgba(13,15,26,.1),0 0 0 1px rgba(100,110,180,.1);
  --sh-lg:0 12px 40px rgba(13,15,26,.15),0 0 0 1px rgba(100,110,180,.1);
  --sh-blue:0 4px 20px rgba(61,111,255,.3);

  --sidebar-w:240px;
  --topbar-h:64px;
  --pad:24px;
}

html,body{margin:0;padding:0;width:100%;scroll-behavior:smooth;}
body{font-family:'Outfit',system-ui,sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased;}
#root{width:100%;min-height:100vh;}
button,input,select,textarea{font-family:inherit;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:var(--bdr2);border-radius:99px;}

/* ── LAYOUT ── */
.ap-shell{display:flex;min-height:100vh;width:100%;}

/* ── SIDEBAR ── */
.ap-sidebar{
  width:var(--sidebar-w);flex-shrink:0;
  background:var(--ink);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;bottom:0;z-index:60;
  overflow:hidden;
  transition:transform .25s ease;
}
.ap-sidebar-logo{
  display:flex;align-items:center;gap:12px;
  padding:20px 20px 16px;
  border-bottom:1px solid rgba(255,255,255,.07);
}
.ap-sidebar-logo-icon{
  width:40px;height:40px;border-radius:10px;
  background:linear-gradient(135deg,var(--blue),var(--purple));
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;box-shadow:0 4px 12px rgba(61,111,255,.4);
}
.ap-sidebar-brand{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#fff;line-height:1.2;}
.ap-sidebar-sub{font-size:11px;color:rgba(255,255,255,.4);font-weight:400;}

.ap-sidebar-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;}
.ap-nav-item{
  display:flex;align-items:center;gap:11px;
  padding:11px 12px;border-radius:10px;border:none;
  background:none;color:rgba(255,255,255,.5);
  font-size:14px;font-weight:500;cursor:pointer;
  transition:all .15s;text-align:left;width:100%;position:relative;
}
.ap-nav-item:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.85);}
.ap-nav-item.active{background:rgba(255,255,255,.1);color:#fff;}
.ap-nav-item.active::before{
  content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);
  width:3px;height:20px;background:linear-gradient(180deg,var(--blue),var(--purple));
  border-radius:0 3px 3px 0;
}
.ap-nav-badge{
  margin-left:auto;padding:2px 8px;border-radius:99px;
  font-size:11px;font-weight:700;
  background:var(--red);color:#fff;
}
.ap-nav-badge.blue{background:var(--blue);}
.ap-sidebar-divider{height:1px;background:rgba(255,255,255,.06);margin:8px 0;}

.ap-sidebar-sale{
  padding:16px 12px;
}
.ap-sidebar-sale-btn{
  width:100%;display:flex;align-items:center;gap:10px;
  padding:13px 16px;border-radius:var(--rad-lg);border:none;
  background:linear-gradient(135deg,var(--blue),var(--purple));
  color:#fff;font-size:14px;font-weight:700;cursor:pointer;
  transition:all .2s;box-shadow:var(--sh-blue);
}
.ap-sidebar-sale-btn:hover{transform:translateY(-1px);box-shadow:0 6px 28px rgba(61,111,255,.5);}
.ap-sidebar-sale-btn:active{transform:scale(.97);}

.ap-sidebar-conn{
  display:flex;align-items:center;gap:8px;
  padding:12px 20px;
  font-size:12px;font-weight:600;
  color:rgba(255,255,255,.3);
  border-top:1px solid rgba(255,255,255,.06);
}
.ap-sidebar-conn.online{color:var(--green);}

/* ── MAIN ── */
.ap-main{
  margin-left:var(--sidebar-w);
  flex:1;display:flex;flex-direction:column;
  min-height:100vh;min-width:0;
}

/* ── TOPBAR ── */
.ap-topbar{
  height:var(--topbar-h);padding:0 var(--pad);
  background:var(--surf);border-bottom:1px solid var(--bdr);
  display:flex;align-items:center;justify-content:space-between;
  gap:16px;position:sticky;top:0;z-index:40;
}
.ap-topbar-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--ink);}
.ap-topbar-right{display:flex;align-items:center;gap:10px;}

/* ── CONTENT ── */
.ap-content{padding:var(--pad);flex:1;max-width:1400px;width:100%;}

/* ── STATS ROW ── */
.ap-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
.ap-stats-wide{grid-template-columns:repeat(2,1fr);margin-bottom:20px;}
.ap-stat{
  background:var(--surf);border-radius:var(--rad-lg);
  border:1px solid var(--bdr);box-shadow:var(--sh);
  padding:18px 20px;transition:all .2s;cursor:default;
}
.ap-stat:hover{box-shadow:var(--sh-md);transform:translateY(-1px);}
.ap-stat-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.ap-stat-icon.blue{background:var(--blue-lt);color:var(--blue);}
.ap-stat-icon.green{background:var(--green-lt);color:var(--green-dk);}
.ap-stat-icon.amber{background:var(--amber-lt);color:var(--amber-dk);}
.ap-stat-icon.red{background:var(--red-lt);color:var(--red-dk);}
.ap-stat-icon.purple{background:var(--purple-lt);color:var(--purple);}
.ap-stat-label{font-size:12px;font-weight:600;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;}
.ap-stat-val{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:var(--ink);line-height:1.1;}
.ap-stat-val.green{color:var(--green-dk);}
.ap-stat-val.amber{color:var(--amber-dk);}
.ap-stat-val.red{color:var(--red-dk);}
.ap-stat-val.blue{color:var(--blue);}
.ap-stat-sub{font-size:12px;color:var(--ink3);margin-top:5px;}

/* ── TOOLBAR ── */
.ap-toolbar{display:flex;gap:10px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
.ap-search-wrap{position:relative;flex:1;min-width:200px;}
.ap-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--ink3);pointer-events:none;}
.ap-search{
  width:100%;padding:11px 12px 11px 40px;
  border:1.5px solid var(--bdr2);border-radius:var(--rad);
  background:var(--surf);color:var(--ink);font-size:14px;
  outline:none;transition:border-color .15s,box-shadow .15s;
}
.ap-search:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(61,111,255,.1);}
.ap-search::placeholder{color:var(--ink3);}
.ap-select{
  padding:11px 36px 11px 12px;border:1.5px solid var(--bdr2);border-radius:var(--rad);
  background:var(--surf);color:var(--ink);font-size:14px;outline:none;cursor:pointer;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238890B0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 10px center;
  transition:border-color .15s;min-width:150px;
}
.ap-select:focus{border-color:var(--blue);}

/* ── BUTTONS ── */
.ap-btn{
  display:inline-flex;align-items:center;gap:7px;
  padding:11px 18px;border-radius:var(--rad);font-size:14px;
  font-weight:600;white-space:nowrap;cursor:pointer;
  border:1.5px solid var(--bdr2);background:var(--surf);color:var(--ink);
  transition:all .15s;
}
.ap-btn:hover{background:var(--surf2);border-color:var(--blue);}
.ap-btn:active{transform:scale(.97);}
.ap-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;}
.ap-btn.primary{background:var(--blue);color:#fff;border-color:var(--blue);box-shadow:var(--sh-blue);}
.ap-btn.primary:hover{background:var(--blue-dk);box-shadow:0 6px 20px rgba(61,111,255,.45);}
.ap-btn.danger{background:var(--red);color:#fff;border-color:var(--red);}
.ap-btn.danger:hover{background:var(--red-dk);}
.ap-btn.ghost{background:transparent;border-color:transparent;}
.ap-btn.ghost:hover{background:var(--surf2);}
.ap-btn.sm{padding:8px 12px;font-size:13px;}
.ap-btn.icon{padding:9px;}

/* ── TABLE (Inventory) ── */
.ap-table-wrap{background:var(--surf);border:1px solid var(--bdr);border-radius:var(--rad-lg);box-shadow:var(--sh);overflow:hidden;}
.ap-table{width:100%;border-collapse:collapse;}
.ap-table th{
  padding:12px 16px;font-size:11px;font-weight:700;
  color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;
  background:var(--surf2);border-bottom:1px solid var(--bdr);
  text-align:left;white-space:nowrap;
}
.ap-table td{
  padding:14px 16px;border-bottom:1px solid var(--bdr);
  font-size:14px;color:var(--ink);vertical-align:middle;
}
.ap-table tr:last-child td{border-bottom:none;}
.ap-table tr:hover td{background:var(--surf2);}
.ap-table-sku{
  font-family:'JetBrains Mono',monospace;font-size:11px;
  color:var(--ink3);background:var(--surf3);
  padding:3px 7px;border-radius:5px;border:1px solid var(--bdr);
  display:inline-block;
}
.ap-table-name{font-weight:600;font-size:14px;color:var(--ink);}
.ap-table-brand{font-size:12px;color:var(--ink3);margin-top:2px;}
.ap-table-price{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--green-dk);}
.ap-table-qty{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;}
.ap-table-qty.in{color:var(--ink);}
.ap-table-qty.low{color:var(--amber-dk);}
.ap-table-qty.out{color:var(--red);}
.ap-table-actions{display:flex;align-items:center;gap:6px;}

/* ── BADGES ── */
.ap-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:700;}
.ap-badge.in{background:var(--green-lt);color:var(--green-dk);}
.ap-badge.low{background:var(--amber-lt);color:var(--amber-dk);}
.ap-badge.out{background:var(--red-lt);color:var(--red-dk);}
.ap-badge-free{
  display:inline-flex;align-items:center;gap:3px;
  padding:3px 8px;border-radius:99px;font-size:11px;font-weight:700;
  background:var(--purple-lt);color:var(--purple-dk);
  border:1px solid rgba(139,92,246,.2);
}

/* ── EMPTY ── */
.ap-empty{padding:64px 20px;text-align:center;}
.ap-empty-icon{font-size:52px;margin-bottom:14px;opacity:.5;}
.ap-empty-txt{font-size:15px;color:var(--ink3);}

/* ── HISTORY ── */
.ap-history-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;}
.ap-report{
  background:var(--surf);border:1px solid var(--bdr);border-radius:var(--rad-lg);
  box-shadow:var(--sh);margin-bottom:12px;overflow:hidden;transition:all .2s;
}
.ap-report:hover{box-shadow:var(--sh-md);border-color:var(--bdr2);}
.ap-report-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 20px;cursor:pointer;user-select:none;gap:12px;
}
.ap-report-head:hover{background:var(--surf2);}
.ap-report-num{
  font-family:'JetBrains Mono',monospace;font-size:11px;
  color:var(--ink3);background:var(--surf3);
  padding:3px 8px;border-radius:6px;margin-bottom:4px;
  display:inline-block;border:1px solid var(--bdr);
}
.ap-report-title{font-weight:700;font-size:15px;color:var(--ink);}
.ap-report-meta{font-size:12px;color:var(--ink3);margin-top:2px;}
.ap-report-total{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--green-dk);}
.ap-report-body{border-top:1px solid var(--bdr);}
.ap-report-row{
  display:flex;align-items:center;gap:12px;
  padding:12px 20px;border-bottom:1px solid var(--bdr);transition:background .1s;
}
.ap-report-row:last-child{border-bottom:none;}
.ap-report-row:hover{background:var(--surf2);}
.ap-report-item-name{font-weight:600;font-size:14px;}
.ap-report-item-sku{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink3);margin-top:2px;}
.ap-stock-delta{
  display:inline-flex;align-items:center;gap:3px;
  padding:3px 9px;border-radius:7px;font-size:11px;font-weight:700;
  background:var(--red-lt);color:var(--red-dk);
}
.ap-report-item-total{font-size:14px;font-weight:700;color:var(--green-dk);}
.ap-report-item-unit{font-size:11px;color:var(--ink3);margin-top:2px;}
.ap-report-summary{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;background:var(--green-lt);border-top:1px solid rgba(0,184,122,.2);
}
.ap-report-summary-label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;color:var(--green-dk);}
.ap-report-summary-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--green-dk);}

/* ── MODALS ── */
.ap-overlay{
  position:fixed;inset:0;background:rgba(13,15,26,.6);
  display:flex;align-items:center;justify-content:center;
  z-index:200;padding:20px;animation:apFade .15s ease;
  backdrop-filter:blur(3px);
}
.ap-modal{
  background:var(--surf);border-radius:var(--rad-xl);
  box-shadow:var(--sh-lg);width:100%;max-width:540px;
  max-height:92dvh;overflow-y:auto;animation:apUp .18s ease;
  border:1px solid var(--bdr2);
}
.ap-modal-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 24px;border-bottom:1px solid var(--bdr);
  position:sticky;top:0;background:var(--surf);z-index:1;
  border-radius:var(--rad-xl) var(--rad-xl) 0 0;
}
.ap-modal-head h3{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;}
.ap-modal-body{padding:22px 24px;}
.ap-modal-foot{
  padding:16px 24px;border-top:1px solid var(--bdr);
  display:flex;justify-content:flex-end;gap:10px;
  position:sticky;bottom:0;background:var(--surf);
}

.ap-form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.ap-fg{margin-bottom:16px;}
.ap-fg:last-child{margin-bottom:0;}
.ap-label{display:block;font-size:12px;font-weight:700;color:var(--ink2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em;}
.ap-input,.ap-fselect,.ap-textarea{
  width:100%;padding:11px 14px;
  border:1.5px solid var(--bdr2);border-radius:var(--rad);
  background:var(--surf);color:var(--ink);font-size:14px;
  outline:none;transition:border-color .15s,box-shadow .15s;
}
.ap-input:focus,.ap-fselect:focus,.ap-textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(61,111,255,.1);}
.ap-input.err{border-color:var(--red) !important;}
.ap-textarea{resize:vertical;min-height:76px;line-height:1.5;}
.ap-ferr{font-size:12px;color:var(--red);margin-top:4px;font-weight:600;}
.ap-fhint{font-size:12px;color:var(--ink3);margin-top:4px;}
.ap-toggle-row{
  display:flex;align-items:center;gap:12px;
  padding:14px 16px;background:var(--purple-lt);
  border-radius:var(--rad);border:1.5px solid rgba(139,92,246,.25);
  cursor:pointer;user-select:none;transition:all .15s;
}
.ap-toggle-row:hover{border-color:var(--purple);}
.ap-toggle-check{
  width:22px;height:22px;border-radius:6px;
  border:2px solid rgba(139,92,246,.4);background:var(--surf);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:all .15s;
}
.ap-toggle-check.on{background:var(--purple);border-color:var(--purple);}
.ap-toggle-label{font-size:13px;font-weight:700;color:var(--purple-dk);flex:1;}
.ap-toggle-sub{font-size:11px;color:var(--purple);}

.ap-confirm{padding:32px 24px;text-align:center;}
.ap-confirm-icon{width:60px;height:60px;border-radius:50%;background:var(--red-lt);color:var(--red);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
.ap-confirm-title{font-family:'Syne',sans-serif;font-size:19px;font-weight:700;margin-bottom:8px;}
.ap-confirm-msg{font-size:14px;color:var(--ink2);line-height:1.6;margin-bottom:24px;}
.ap-confirm-actions{display:flex;gap:10px;justify-content:center;}

/* ── SALES MODAL ── */
.ap-sales-modal{max-width:620px;}
.ap-sales-item{
  display:flex;align-items:center;gap:12px;
  padding:14px 0;border-bottom:1px solid var(--bdr);
}
.ap-sales-item:last-child{border-bottom:none;}
.ap-sales-name{font-weight:700;font-size:14px;color:var(--ink);}
.ap-sales-meta{font-size:12px;color:var(--ink3);margin-top:2px;}
.ap-sales-price{font-size:13px;font-weight:700;color:var(--green-dk);min-width:72px;text-align:right;flex-shrink:0;}
.ap-qty-btn{
  width:36px;height:36px;border-radius:8px;
  border:1.5px solid var(--bdr2);background:var(--surf2);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .12s;flex-shrink:0;
}
.ap-qty-btn:hover{background:var(--blue-lt);border-color:var(--blue);}
.ap-qty-input{
  width:52px;text-align:center;padding:7px;
  border:1.5px solid var(--bdr2);border-radius:8px;
  font-size:15px;font-weight:700;outline:none;transition:border-color .15s;
}
.ap-qty-input:focus{border-color:var(--blue);}
.ap-sale-summary{
  background:var(--green-lt);border-radius:var(--rad);
  padding:16px 18px;margin-top:16px;
  display:flex;justify-content:space-between;align-items:center;
  border:1px solid rgba(0,184,122,.2);
}
.ap-sale-summary-label{font-size:12px;color:var(--green-dk);font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
.ap-sale-summary-val{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;color:var(--green-dk);}

/* ── HISTORY TOOLBAR ── */
.ap-history-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.ap-date-select{
  padding:11px 34px 11px 12px;border:1.5px solid var(--bdr2);border-radius:var(--rad);
  background:var(--surf);color:var(--ink);font-size:14px;font-weight:600;
  outline:none;cursor:pointer;appearance:none;flex-shrink:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238890B0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 10px center;
  transition:all .15s;
}
.ap-date-select:focus{border-color:var(--blue);}
.ap-date-select.on{border-color:var(--blue);color:var(--blue);background-color:var(--blue-lt);}
.ap-report-del{
  width:36px;height:36px;border-radius:8px;
  border:1px solid transparent;background:transparent;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--ink3);transition:all .12s;flex-shrink:0;
}
.ap-report-del:hover{background:var(--red-lt);color:var(--red);}

/* ── TOASTS ── */
.ap-toasts{position:fixed;bottom:24px;right:24px;z-index:400;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
.ap-toast{
  display:flex;align-items:center;gap:10px;
  padding:12px 20px;border-radius:var(--rad-lg);
  font-size:14px;font-weight:600;color:#fff;
  box-shadow:var(--sh-lg);animation:apUp .2s ease;max-width:340px;
  pointer-events:auto;
}
.ap-toast.success{background:linear-gradient(135deg,var(--green-dk),var(--green));}
.ap-toast.error{background:linear-gradient(135deg,var(--red-dk),var(--red));}
.ap-toast.info{background:linear-gradient(135deg,var(--blue),var(--purple));}

/* ── LOADING ── */
.ap-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:14px;}
.ap-loading-txt{font-size:14px;color:var(--ink3);font-weight:500;}
@keyframes spin{to{transform:rotate(360deg)}}
.ap-spin{animation:spin 1s linear infinite;color:var(--blue);}

/* ── MOBILE BOTTOM NAV (hidden on wide) ── */
.ap-bottom-nav{display:none;}
.ap-mob-fab{display:none;}

@keyframes apFade{from{opacity:0}to{opacity:1}}
@keyframes apUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

/* ── RESPONSIVE ── */
/* Tablet: sidebar collapses to icons or bottom nav */
@media(max-width:900px){
  :root{--sidebar-w:0px;--pad:18px;}
  .ap-sidebar{transform:translateX(-240px);width:240px;}
  .ap-sidebar.open{transform:translateX(0);}
  .ap-main{margin-left:0;padding-bottom:72px;}
  .ap-bottom-nav{
    display:flex;position:fixed;bottom:0;left:0;right:0;
    height:68px;background:var(--surf);border-top:1px solid var(--bdr);
    align-items:center;justify-content:space-around;
    padding:0 12px 6px;z-index:100;
    box-shadow:0 -4px 20px rgba(13,15,26,.08);
  }
  .ap-mob-nav-btn{
    display:flex;flex-direction:column;align-items:center;gap:4px;
    padding:8px 20px;border-radius:12px;border:none;
    background:none;font-size:11px;font-weight:600;color:var(--ink3);
    cursor:pointer;transition:all .15s;position:relative;min-width:80px;
  }
  .ap-mob-nav-btn:hover{background:var(--surf2);color:var(--blue);}
  .ap-mob-nav-btn.active{background:var(--blue-lt);color:var(--blue);}
  .ap-mob-nav-badge{
    position:absolute;top:4px;right:14px;background:var(--red);
    color:#fff;font-size:10px;font-weight:700;
    min-width:17px;height:17px;padding:0 4px;border-radius:99px;
    display:flex;align-items:center;justify-content:center;
  }
  .ap-mob-fab{
    display:flex;align-items:center;justify-content:center;
    width:52px;height:52px;border-radius:50%;border:none;
    background:linear-gradient(135deg,var(--blue),var(--purple));
    color:#fff;box-shadow:var(--sh-blue);cursor:pointer;
    transition:all .2s;
  }
  .ap-mob-fab:hover{transform:scale(1.07);}
  .ap-mob-overlay{
    display:none;position:fixed;inset:0;z-index:55;
    background:rgba(13,15,26,.5);
  }
  .ap-mob-overlay.vis{display:block;}
}

@media(max-width:768px){
  .ap-stats{grid-template-columns:repeat(2,1fr);}
  .ap-history-stats{grid-template-columns:repeat(2,1fr);}
  .ap-toolbar{flex-direction:column;align-items:stretch;}
  .ap-history-toolbar{flex-direction:column;align-items:stretch;}
  .ap-topbar-title{font-size:17px;}
}

@media(max-width:560px){
  :root{--pad:14px;}
  .ap-form-row{grid-template-columns:1fr;}
  .ap-overlay{align-items:flex-end;padding:0;}
  .ap-modal{border-radius:var(--rad-xl) var(--rad-xl) 0 0;max-width:100%;max-height:96dvh;}
  .ap-modal-head{border-radius:var(--rad-xl) var(--rad-xl) 0 0;}
  .ap-confirm-actions{flex-direction:column;}
  .ap-confirm-actions .ap-btn{justify-content:center;}
  .ap-history-stats{grid-template-columns:1fr;}
  .ap-stats{grid-template-columns:1fr 1fr;}
  .ap-stats-wide{grid-template-columns:1fr;}
  .ap-table th,.ap-table td{padding:10px 12px;}
}

@media(max-width:400px){
  .ap-stats{grid-template-columns:1fr;}
}
`;

// ─────────────────────────────────────────────
//  STYLE INJECTOR
// ─────────────────────────────────────────────
function useStyles() {
  useEffect(() => {
    const id = "ap-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    document.documentElement.style.cssText = "margin:0;padding:0;width:100%;";
    document.body.style.cssText = "margin:0;padding:0;width:100%;";
    const root = document.getElementById("root");
    if (root) root.style.cssText = "width:100%;min-height:100vh;margin:0;padding:0;";
  }, []);
}

// ─────────────────────────────────────────────
//  TOAST HOOK
// ─────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "success") => {
    const id = Math.random().toString(36).slice(2, 10);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, toast };
}

// ─────────────────────────────────────────────
//  FIREBASE INVENTORY HOOK
// ─────────────────────────────────────────────
function useInventory(toast) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setOnline(true);
      },
      (err) => {
        console.error(err);
        setOnline(false);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const addItem = useCallback(async (form) => {
    try {
      await addDoc(collection(db, "inventory"), {
        sku: form.sku.trim().toUpperCase(),
        name: form.name.trim(),
        brand: form.brand.trim(),
        price: Math.round(+form.price),
        qty: Math.max(0, Math.round(+form.qty)),
        low: Math.max(1, Math.round(+form.low) || 3),
        desc: form.desc?.trim() || "",
        freeTempered: !!form.freeTempered,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      toast?.("Failed to add part: " + e.message, "error");
    }
  }, [toast]);

  const updateItem = useCallback(async (form) => {
    try {
      const ref = doc(db, "inventory", form.id);
      await updateDoc(ref, {
        sku: form.sku.trim().toUpperCase(),
        name: form.name.trim(),
        brand: form.brand.trim(),
        price: Math.round(+form.price),
        qty: Math.max(0, Math.round(+form.qty)),
        low: Math.max(1, Math.round(+form.low) || 3),
        desc: form.desc?.trim() || "",
        freeTempered: !!form.freeTempered,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      toast?.("Failed to update: " + e.message, "error");
    }
  }, [toast]);

  const deleteItem = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, "inventory", id));
    } catch (e) {
      toast?.("Failed to delete: " + e.message, "error");
    }
  }, [toast]);

  const deductQty = useCallback(async (saleItems) => {
    try {
      await Promise.all(
        saleItems.map((s) =>
          updateDoc(doc(db, "inventory", s.id), {
            qty: Math.max(0, s.currentQty - s.qty),
            updatedAt: serverTimestamp(),
          })
        )
      );
    } catch (e) {
      toast?.("Failed to deduct stock: " + e.message, "error");
    }
  }, [toast]);

  return { items, loading, online, addItem, updateItem, deleteItem, deductQty };
}

// ─────────────────────────────────────────────
//  FIREBASE SALES HISTORY HOOK
// ─────────────────────────────────────────────
function useSalesHistory(toast) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("soldAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const addSaleReport = useCallback(async (saleItems) => {
    const total = saleItems.reduce((s, i) => s + i.price * i.qty, 0);
    try {
      await addDoc(collection(db, "sales"), {
        items: saleItems,
        total,
        soldAt: serverTimestamp(),
      });
    } catch (e) {
      toast?.("Failed to save sale: " + e.message, "error");
    }
  }, [toast]);

  const deleteSaleReport = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, "sales", id));
    } catch (e) {
      toast?.("Failed to delete record: " + e.message, "error");
    }
  }, [toast]);

  return { reports, loading, addSaleReport, deleteSaleReport };
}

// ─────────────────────────────────────────────
//  DATE FILTER HELPERS
// ─────────────────────────────────────────────
const DATE_FILTERS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "last", label: "Last Month" },
];

function matchesDateFilter(ts, key) {
  if (!ts) return key === "all";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  if (key === "all") return true;
  if (key === "today") return d.toDateString() === now.toDateString();
  if (key === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (key === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (key === "last") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return d >= lastMonth && d <= lastMonthEnd;
  }
  return true;
}

// ─────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────
function StatCard({ label, value, color, sub, icon: Icon }) {
  return (
    <div className="ap-stat">
      {Icon && (
        <div className={`ap-stat-icon ${color || "blue"}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
      <div className="ap-stat-label">{label}</div>
      <div className={`ap-stat-val${color ? ` ${color}` : ""}`}>{value}</div>
      {sub && <div className="ap-stat-sub">{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
//  INVENTORY TAB — Table Layout
// ─────────────────────────────────────────────
function InventoryTab({ items, loading, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const stats = useMemo(() => ({
    total: items.length,
    in: items.filter((i) => stockStatus(i) === "in").length,
    low: items.filter((i) => stockStatus(i) === "low").length,
    out: items.filter((i) => stockStatus(i) === "out").length,
    value: items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0),
    units: items.reduce((s, i) => s + (Number(i.qty) || 0), 0),
  }), [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchQ = !q || [item.name, item.sku, item.brand, item.desc].some((v) => v?.toLowerCase().includes(q));
      const matchS = !stockFilter || stockStatus(item) === stockFilter;
      return matchQ && matchS;
    });
  }, [items, search, stockFilter]);

  if (loading) return (
    <div className="ap-loading">
      <Loader2 size={32} className="ap-spin" />
      <div className="ap-loading-txt">Loading inventory from Firebase…</div>
    </div>
  );

  return (
    <>
      <div className="ap-stats">
        <StatCard label="Total Parts" value={stats.total} icon={Package} color="blue" />
        <StatCard label="In Stock" value={stats.in} color="green" sub={`${stats.in} of ${stats.total} parts`} icon={CheckCircle} />
        <StatCard label="Low Stock" value={stats.low} color="amber" sub="Need restocking" icon={AlertTriangle} />
        <StatCard label="Out of Stock" value={stats.out} color="red" sub="Unavailable" icon={AlertCircle} />
      </div>
      <div className="ap-stats ap-stats-wide">
        <StatCard label="Inventory Value" value={`₱${fmt(stats.value)}`} color="blue" sub="Total stock worth" icon={BarChart3} />
        <StatCard label="Total Units" value={fmt(stats.units)} sub="Units in stock" icon={Tag} color="green" />
      </div>

      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><Search size={16} strokeWidth={1.8} /></span>
          <input
            className="ap-search"
            placeholder="Search by name, SKU, brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="ap-select" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="">All Stock Levels</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <button className="ap-btn primary" onClick={onAdd}>
          <Plus size={15} strokeWidth={2.2} /> Add Part
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="ap-empty">
          <div className="ap-empty-icon">📦</div>
          <div className="ap-empty-txt">No parts found. Try adjusting your filters.</div>
        </div>
      ) : (
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const s = stockStatus(item);
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="ap-table-sku">{item.sku}</span>
                    </td>
                    <td>
                      <div className="ap-table-name">{item.name}</div>
                      <div className="ap-table-brand">{item.brand || "—"}</div>
                      {item.freeTempered && (
                        <span className="ap-badge-free" style={{ marginTop: 4 }}>
                          <Gift size={10} strokeWidth={2} /> Free Tempered Glass
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="ap-table-price">₱{fmt(item.price)}</div>
                    </td>
                    <td>
                      <span className={`ap-table-qty ${s}`}>{item.qty}</span>
                    </td>
                    <td>
                      <span className={`ap-badge ${s}`}>
                        {s === "low" && <TrendingDown size={10} strokeWidth={2.5} />}
                        {STOCK_LABELS[s]}
                      </span>
                    </td>
                    <td>
                      <div className="ap-table-actions" style={{ justifyContent: "flex-end" }}>
                        <button className="ap-btn ghost sm icon" title="Edit" onClick={() => onEdit(item)}>
                          <Pencil size={15} strokeWidth={1.8} />
                        </button>
                        <button className="ap-btn ghost sm icon" title="Delete" style={{ color: "var(--red)" }} onClick={() => onDelete(item)}>
                          <Trash2 size={15} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
//  HISTORY TAB
// ─────────────────────────────────────────────
function HistoryTab({ reports, loading, onDeleteReport }) {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reports.filter((r) => {
      const matchDate = matchesDateFilter(r.soldAt, dateFilter);
      const matchQ = !q || r.items.some((i) => i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q));
      return matchDate && matchQ;
    });
  }, [reports, search, dateFilter]);

  const totalRevenue = useMemo(() => filtered.reduce((s, r) => s + (r.total || 0), 0), [filtered]);
  const totalSold = useMemo(() => filtered.reduce((s, r) => s + r.items.reduce((ss, i) => ss + i.qty, 0), 0), [filtered]);

  const handleDeleteConfirm = () => {
    onDeleteReport(deleteTarget.id);
    if (expanded === deleteTarget.id) setExpanded(null);
    setDeleteTarget(null);
  };

  if (loading) return (
    <div className="ap-loading">
      <Loader2 size={32} className="ap-spin" />
      <div className="ap-loading-txt">Loading sales history from Firebase…</div>
    </div>
  );

  return (
    <>
      <div className="ap-history-stats">
        <StatCard label="Transactions" value={filtered.length} sub={DATE_FILTERS.find(f => f.key === dateFilter)?.label} icon={History} color="blue" />
        <StatCard label="Revenue" value={`₱${fmt(totalRevenue)}`} color="green" sub={DATE_FILTERS.find(f => f.key === dateFilter)?.label} icon={BarChart3} />
        <StatCard label="Units Sold" value={fmt(totalSold)} color="blue" sub={DATE_FILTERS.find(f => f.key === dateFilter)?.label} icon={Tag} />
      </div>

      <div className="ap-history-toolbar">
        <select
          className={`ap-date-select${dateFilter !== "all" ? " on" : ""}`}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          {DATE_FILTERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><Search size={16} strokeWidth={1.8} /></span>
          <input
            className="ap-search"
            placeholder="Search by product name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ap-empty">
          <div className="ap-empty-icon">📋</div>
          <div className="ap-empty-txt">
            {reports.length === 0
              ? "Wala pang sales history. I-process ang sale gamit ang Process Sale button."
              : "No transactions match your filters."}
          </div>
        </div>
      ) : (
        filtered.map((report, idx) => {
          const isOpen = expanded === report.id;
          const totalUnits = report.items.reduce((s, i) => s + i.qty, 0);
          const saleNum = reports.length - reports.findIndex(r => r.id === report.id);
          return (
            <div key={report.id} className="ap-report">
              <div className="ap-report-head" onClick={() => setExpanded(isOpen ? null : report.id)}>
                <div style={{ flex: 1 }}>
                  <div className="ap-report-num">Sale #{saleNum}</div>
                  <div className="ap-report-title">{report.items.map(i => i.name).join(", ").slice(0, 60)}{report.items.map(i => i.name).join(", ").length > 60 ? "…" : ""}</div>
                  <div className="ap-report-meta">{fmtDate(report.soldAt)} · {report.items.length} product{report.items.length !== 1 ? "s" : ""} · {totalUnits} unit{totalUnits !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div className="ap-report-total">₱{fmt(report.total)}</div>
                  <button className="ap-report-del" title="Delete record" onClick={(e) => { e.stopPropagation(); setDeleteTarget(report); }}>
                    <Trash2 size={15} strokeWidth={1.8} />
                  </button>
                  <ChevronDown size={17} strokeWidth={1.8} style={{ color: "var(--ink3)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </div>
              </div>

              {isOpen && (
                <div className="ap-report-body">
                  {report.items.map((item, i) => {
                    const afterQty = item.currentQty - item.qty;
                    return (
                      <div key={i} className="ap-report-row">
                        <div style={{ flex: 1 }}>
                          <div className="ap-report-item-name">{item.name}</div>
                          <div className="ap-report-item-sku">{item.sku}</div>
                          {item.freeTempered && (
                            <span className="ap-badge-free" style={{ marginTop: 3 }}>
                              <Gift size={10} /> Free Tempered
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span className="ap-stock-delta">
                            <ArrowDown size={10} strokeWidth={2.5} />
                            −{item.qty} unit{item.qty !== 1 ? "s" : ""}
                          </span>
                          {item.currentQty !== undefined && (
                            <span style={{ fontSize: 12, color: "var(--ink3)", whiteSpace: "nowrap" }}>
                              {item.currentQty} → {Math.max(0, afterQty)}
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div className="ap-report-item-total">₱{fmt(item.price * item.qty)}</div>
                          <div className="ap-report-item-unit">₱{fmt(item.price)} × {item.qty}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="ap-report-summary">
                    <div>
                      <div className="ap-report-summary-label">Sale Total</div>
                      <div style={{ fontSize: 12, color: "var(--green-dk)", marginTop: 2 }}>
                        {totalUnits} unit{totalUnits !== 1 ? "s" : ""} across {report.items.length} product{report.items.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="ap-report-summary-val">₱{fmt(report.total)}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {deleteTarget && (
        <div className="ap-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="ap-modal" style={{ maxWidth: 380 }}>
            <div className="ap-confirm">
              <div className="ap-confirm-icon"><Trash2 size={24} strokeWidth={1.8} /></div>
              <div className="ap-confirm-title">Delete Sale Record?</div>
              <div className="ap-confirm-msg">
                Sale #{reports.length - reports.findIndex(r => r.id === deleteTarget.id)}<br />
                <strong>₱{fmt(deleteTarget.total)}</strong> — {fmtDate(deleteTarget.soldAt)}<br />
                <span style={{ fontSize: 13, color: "var(--red)", marginTop: 8, display: "block" }}>This only deletes the record. Stock is not restored.</span>
              </div>
              <div className="ap-confirm-actions">
                <button className="ap-btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="ap-btn danger" onClick={handleDeleteConfirm}>
                  <Trash2 size={14} strokeWidth={1.8} /> Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
//  ITEM MODAL (Add / Edit)
// ─────────────────────────────────────────────
const EMPTY_FORM = { sku: "", name: "", brand: "", price: "", qty: "", low: "3", desc: "", freeTempered: false };

function ItemModal({ item, onSave, onClose, existingSKUs }) {
  const isEdit = !!item?.id;
  const [form, setForm] = useState(
    item
      ? { ...item, price: String(item.price), qty: String(item.qty), low: String(item.low), freeTempered: !!item.freeTempered }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.sku.trim()) e.sku = "SKU is required";
    else if (!isEdit && existingSKUs.includes(form.sku.trim().toUpperCase())) e.sku = "SKU already exists";
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price || isNaN(+form.price) || +form.price < 0) e.price = "Enter a valid price";
    if (form.qty === "" || isNaN(+form.qty) || +form.qty < 0) e.qty = "Enter a valid quantity";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="ap-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal">
        <div className="ap-modal-head">
          <h3>{isEdit ? "Edit Part" : "Add New Part"}</h3>
          <button className="ap-btn ghost icon" onClick={onClose}><X size={18} strokeWidth={1.8} /></button>
        </div>

        <div className="ap-modal-body">
          <div className="ap-fg">
            <div
              className="ap-toggle-row"
              onClick={() => set("freeTempered", !form.freeTempered)}
            >
              <div className={`ap-toggle-check${form.freeTempered ? " on" : ""}`}>
                {form.freeTempered && <Check size={13} color="#fff" strokeWidth={2.5} />}
              </div>
              <div style={{ flex: 1 }}>
                <div className="ap-toggle-label">🎁 Free Tempered Glass Included</div>
                <div className="ap-toggle-sub">I-tick kung kasama ang libre na tempered glass</div>
              </div>
              <Gift size={16} color="var(--purple)" strokeWidth={2} />
            </div>
          </div>

          <div className="ap-form-row">
            <div className="ap-fg">
              <label className="ap-label">SKU *</label>
              <input ref={firstRef} className={`ap-input${errors.sku ? " err" : ""}`} value={form.sku} placeholder="e.g. SCR-001" onChange={(e) => set("sku", e.target.value)} />
              {errors.sku && <div className="ap-ferr">{errors.sku}</div>}
            </div>
            <div className="ap-fg">
              <label className="ap-label">Brand</label>
              <input className="ap-input" value={form.brand} placeholder="e.g. Apple, Samsung" onChange={(e) => set("brand", e.target.value)} />
            </div>
          </div>

          <div className="ap-fg">
            <label className="ap-label">Part Name *</label>
            <input className={`ap-input${errors.name ? " err" : ""}`} value={form.name} placeholder="e.g. iPhone 14 OLED Screen" onChange={(e) => set("name", e.target.value)} />
            {errors.name && <div className="ap-ferr">{errors.name}</div>}
          </div>

          <div className="ap-form-row">
            <div className="ap-fg">
              <label className="ap-label">Price (₱) *</label>
              <input className={`ap-input${errors.price ? " err" : ""}`} type="number" min="0" value={form.price} placeholder="0" onChange={(e) => set("price", e.target.value)} />
              {errors.price && <div className="ap-ferr">{errors.price}</div>}
            </div>
            <div className="ap-fg">
              <label className="ap-label">Stock Quantity *</label>
              <input className={`ap-input${errors.qty ? " err" : ""}`} type="number" min="0" value={form.qty} placeholder="0" onChange={(e) => set("qty", e.target.value)} />
              {errors.qty && <div className="ap-ferr">{errors.qty}</div>}
            </div>
          </div>

          <div className="ap-fg">
            <label className="ap-label">Low Stock Alert Threshold</label>
            <input className="ap-input" type="number" min="1" value={form.low} placeholder="3" onChange={(e) => set("low", e.target.value)} />
            <div className="ap-fhint">Mag-aalert kapag qty ≤ threshold na ito</div>
          </div>

          <div className="ap-fg">
            <label className="ap-label">Description / Notes</label>
            <textarea className="ap-textarea" value={form.desc} placeholder="Optional specs or notes…" onChange={(e) => set("desc", e.target.value)} />
          </div>
        </div>

        <div className="ap-modal-foot">
          <button className="ap-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ap-btn primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={15} className="ap-spin" /> : <Check size={15} strokeWidth={2.2} />}
            {isEdit ? "Update Part" : "Save Part"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  DELETE MODAL
// ─────────────────────────────────────────────
function DeleteModal({ item, onConfirm, onClose }) {
  return (
    <div className="ap-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal" style={{ maxWidth: 380 }}>
        <div className="ap-confirm">
          <div className="ap-confirm-icon"><Trash2 size={24} strokeWidth={1.8} /></div>
          <div className="ap-confirm-title">Delete Part?</div>
          <div className="ap-confirm-msg"><strong>{item.name}</strong><br />This action cannot be undone.</div>
          <div className="ap-confirm-actions">
            <button className="ap-btn" onClick={onClose}>Cancel</button>
            <button className="ap-btn danger" onClick={onConfirm}>
              <Trash2 size={14} strokeWidth={1.8} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  SALES MODAL
// ─────────────────────────────────────────────
function SalesModal({ items, onClose, onConfirm }) {
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const setQty = (id, val) => {
    const max = items.find((i) => i.id === id)?.qty || 0;
    const n = Math.max(0, Math.min(max, Number(val) || 0));
    setQuantities((q) => ({ ...q, [id]: n }));
  };

  const inStockItems = useMemo(() => {
    const q = search.toLowerCase();
    return items
      .filter((i) => i.qty > 0)
      .filter((i) => !q || i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q));
  }, [items, search]);

  const selectedItems = items.filter((i) => (quantities[i.id] || 0) > 0);
  const total = selectedItems.reduce((s, i) => s + i.price * (quantities[i.id] || 0), 0);

  const handleConfirm = async () => {
    if (selectedItems.length === 0 || saving) return;
    setSaving(true);
    await onConfirm(selectedItems.map((i) => ({
      id: i.id, sku: i.sku, name: i.name,
      price: i.price, qty: quantities[i.id], currentQty: i.qty, freeTempered: !!i.freeTempered,
    })));
    setSaving(false);
    onClose();
  };

  return (
    <div className="ap-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal ap-sales-modal" role="dialog">
        <div className="ap-modal-head">
          <h3>Process Sale</h3>
          <button className="ap-btn ghost icon" onClick={onClose}><X size={18} strokeWidth={1.8} /></button>
        </div>

        <div className="ap-modal-body">
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span className="ap-search-icon"><Search size={15} strokeWidth={1.8} /></span>
            <input className="ap-search" placeholder="Filter products…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {inStockItems.length === 0 ? (
            <div className="ap-empty" style={{ padding: "32px 0" }}>
              <div className="ap-empty-icon">📭</div>
              <div className="ap-empty-txt">Walang items in stock para ibenta.</div>
            </div>
          ) : (
            inStockItems.map((item) => (
              <div key={item.id} className="ap-sales-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ap-sales-name">{item.name}</div>
                  <div className="ap-sales-meta">{item.sku} · Stock: {item.qty} · ₱{fmt(item.price)}</div>
                  {item.freeTempered && (
                    <span className="ap-badge-free" style={{ marginTop: 4 }}>
                      <Gift size={10} strokeWidth={2} /> Free Tempered Glass
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <button className="ap-qty-btn" onClick={() => setQty(item.id, (quantities[item.id] || 0) - 1)}>
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <input
                    className="ap-qty-input"
                    type="number" min="0" max={item.qty}
                    value={quantities[item.id] || 0}
                    onChange={(e) => setQty(item.id, e.target.value)}
                  />
                  <button className="ap-qty-btn" onClick={() => setQty(item.id, (quantities[item.id] || 0) + 1)}>
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
                <div className="ap-sales-price">
                  {(quantities[item.id] || 0) > 0 ? `₱${fmt(item.price * (quantities[item.id] || 0))}` : "—"}
                </div>
              </div>
            ))
          )}

          {selectedItems.length > 0 && (
            <div className="ap-sale-summary">
              <div>
                <div className="ap-sale-summary-label">Total Sale</div>
                <div style={{ fontSize: 12, color: "var(--green-dk)", marginTop: 4 }}>
                  {selectedItems.length} product{selectedItems.length !== 1 ? "s" : ""} · {selectedItems.reduce((s, i) => s + (quantities[i.id] || 0), 0)} units
                </div>
              </div>
              <div className="ap-sale-summary-val">₱{fmt(total)}</div>
            </div>
          )}
        </div>

        <div className="ap-modal-foot">
          <button className="ap-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="ap-btn primary" onClick={handleConfirm} disabled={selectedItems.length === 0 || saving}>
            {saving ? <Loader2 size={14} className="ap-spin" /> : <Check size={14} strokeWidth={2.2} />}
            {selectedItems.length > 0 ? `Confirm Sale · ₱${fmt(total)}` : "Confirm Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TOAST STACK
// ─────────────────────────────────────────────
function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  const icons = {
    success: <CheckCircle size={15} strokeWidth={2} />,
    error: <AlertCircle size={15} strokeWidth={2} />,
    info: <Info size={15} strokeWidth={2} />,
  };
  return (
    <div className="ap-toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`ap-toast ${t.type}`}>{icons[t.type]}{t.msg}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────
export default function MaxileeyamInventory() {
  useStyles();

  const { toasts, toast } = useToast();
  const { items, loading: invLoading, online, addItem, updateItem, deleteItem, deductQty } = useInventory(toast);
  const { reports, loading: histLoading, addSaleReport, deleteSaleReport } = useSalesHistory(toast);

  const [tab, setTab] = useState("inventory");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [salesOpen, setSalesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const alertCount = useMemo(
    () => items.filter((i) => stockStatus(i) === "low" || stockStatus(i) === "out").length,
    [items]
  );

  const existingSKUs = useMemo(
    () => items.filter((i) => i.id !== editItem?.id).map((i) => i.sku),
    [items, editItem]
  );

  const handleAdd = async (form) => { await addItem(form); setAddOpen(false); toast("Part added successfully!", "success"); };
  const handleUpdate = async (form) => { await updateItem(form); setEditItem(null); toast("Part updated!", "success"); };
  const handleDelete = async () => { await deleteItem(deleteTarget.id); toast(`"${deleteTarget.name}" deleted.`, "error"); setDeleteTarget(null); };
  const handleDeleteReport = async (id) => { await deleteSaleReport(id); toast("Sale record deleted.", "error"); };
  const handleSale = async (saleItems) => {
    await deductQty(saleItems);
    await addSaleReport(saleItems);
    const total = saleItems.reduce((s, i) => s + i.price * i.qty, 0);
    toast(`Sale recorded! ₱${fmt(total)} total.`, "success");
  };

  const PAGE_TITLES = { inventory: "Inventory", history: "Sales History" };

  return (
    <div className="ap-shell">
      {/* Sidebar overlay for mobile */}
      <div
        className={`ap-mob-overlay${sidebarOpen ? " vis" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`ap-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="ap-sidebar-logo">
          <div className="ap-sidebar-logo-icon">
            <Smartphone size={20} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div className="ap-sidebar-brand">Maxileeyam</div>
            <div className="ap-sidebar-sub">Parts & Accessories</div>
          </div>
        </div>

        <nav className="ap-sidebar-nav">
          <button
            className={`ap-nav-item${tab === "inventory" ? " active" : ""}`}
            onClick={() => { setTab("inventory"); setSidebarOpen(false); }}
          >
            <Package size={17} strokeWidth={1.8} />
            Inventory
            {alertCount > 0 && <span className="ap-nav-badge">{alertCount}</span>}
          </button>

          <div className="ap-sidebar-divider" />

          <button
            className={`ap-nav-item${tab === "history" ? " active" : ""}`}
            onClick={() => { setTab("history"); setSidebarOpen(false); }}
          >
            <History size={17} strokeWidth={1.8} />
            Sales History
            {reports.length > 0 && <span className="ap-nav-badge blue">{reports.length}</span>}
          </button>
        </nav>

        <div className="ap-sidebar-sale">
          <button className="ap-sidebar-sale-btn" onClick={() => { setSalesOpen(true); setSidebarOpen(false); }}>
            <ShoppingCart size={17} strokeWidth={2} />
            Process Sale
          </button>
        </div>

        <div className={`ap-sidebar-conn${online ? " online" : ""}`}>
          {online
            ? <><Wifi size={13} /> Connected to Firebase</>
            : <><WifiOff size={13} /> Offline — check connection</>
          }
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="ap-main">
        {/* Topbar */}
        <header className="ap-topbar">
          {/* Hamburger for mobile */}
          <button
            className="ap-btn ghost icon"
            style={{ display: "none" }}
            id="ap-ham"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="ap-topbar-title">{PAGE_TITLES[tab]}</div>
          <div className="ap-topbar-right">
            {tab === "inventory" && (
              <button className="ap-btn primary" onClick={() => setAddOpen(true)}>
                <Plus size={15} strokeWidth={2.2} /> Add Part
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="ap-content">
          {tab === "inventory" ? (
            <InventoryTab
              items={items}
              loading={invLoading}
              onAdd={() => setAddOpen(true)}
              onEdit={(item) => setEditItem(item)}
              onDelete={(item) => setDeleteTarget(item)}
            />
          ) : (
            <HistoryTab
              reports={reports}
              loading={histLoading}
              onDeleteReport={handleDeleteReport}
            />
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="ap-bottom-nav">
        <button
          className={`ap-mob-nav-btn${tab === "inventory" ? " active" : ""}`}
          onClick={() => setTab("inventory")}
        >
          <Package size={20} strokeWidth={1.8} />
          <span>Inventory</span>
          {alertCount > 0 && <span className="ap-mob-nav-badge">{alertCount}</span>}
        </button>

        <button className="ap-mob-fab" onClick={() => setSalesOpen(true)} title="Process Sale">
          <ShoppingCart size={22} strokeWidth={2} />
        </button>

        <button
          className={`ap-mob-nav-btn${tab === "history" ? " active" : ""}`}
          onClick={() => setTab("history")}
        >
          <History size={20} strokeWidth={1.8} />
          <span>History</span>
          {reports.length > 0 && <span className="ap-mob-nav-badge" style={{ background: "var(--blue)" }}>{reports.length}</span>}
        </button>
      </nav>

      {/* Inject hamburger visibility via inline style */}
      <style>{`
        @media(max-width:900px){
          #ap-ham{display:flex !important;}
        }
      `}</style>

      {/* Modals */}
      {addOpen && <ItemModal item={null} onSave={handleAdd} onClose={() => setAddOpen(false)} existingSKUs={existingSKUs} />}
      {editItem && <ItemModal item={editItem} onSave={handleUpdate} onClose={() => setEditItem(null)} existingSKUs={existingSKUs} />}
      {deleteTarget && <DeleteModal item={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
      {salesOpen && <SalesModal items={items} onClose={() => setSalesOpen(false)} onConfirm={handleSale} />}

      <ToastStack toasts={toasts} />
    </div>
  );
}