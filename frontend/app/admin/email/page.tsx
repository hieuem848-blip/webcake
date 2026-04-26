'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminShell from '../components/AdminShell';
import {
  Mail, MailOpen, Star, Trash2, Send, Users, Inbox,
  Search, RefreshCw, X, Reply, ChevronLeft, ChevronRight,
  CheckSquare, Square, Filter, Briefcase, MessageSquare,
  BellRing, ArrowLeft, FileText, Phone, AtSign, Tag,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || '';
}
function apiFetch(path: string, opts: RequestInit = {}) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...opts.headers },
  }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || 'Lỗi'); return d; });
}

// ── Types ──────────────────────────────────────────────────────────────────
type EmailType = 'subscribe' | 'contact' | 'career';
interface InboxEmail {
  _id: string; type: EmailType; senderName: string; senderEmail: string;
  senderPhone: string; subject: string; content: string; position: string;
  isRead: boolean; isStarred: boolean; isDeleted: boolean; adminNote: string;
  createdAt: string;
}
interface TypeCount { _id: EmailType; count: number; unread: number; }
interface Subscriber { _id: string; email: string; createdAt: string; }

// ── Helpers ────────────────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; }> = {
  subscribe: { label: 'Tin tức', icon: <BellRing className="w-3.5 h-3.5" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  contact:   { label: 'Liên hệ', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-green-700', bg: 'bg-green-100' },
  career:    { label: 'Công việc', icon: <Briefcase className="w-3.5 h-3.5" />, color: 'text-orange-700', bg: 'bg-orange-100' },
};
const fmtDate = (s: string) => {
  const d = new Date(s), now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Hôm qua';
  if (diff < 7) return `${diff} ngày trước`;
  return d.toLocaleDateString('vi-VN');
};
const fmtFull = (s: string) => new Date(s).toLocaleString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AdminEmailPage() {
  const [tab, setTab] = useState<'inbox' | 'compose' | 'subscribers'>('inbox');

  // inbox state
  const [emails, setEmails] = useState<InboxEmail[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typeCounts, setTypeCounts] = useState<TypeCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [filterStar, setFilterStar] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // detail state
  const [detail, setDetail] = useState<InboxEmail | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyMsg, setReplyMsg] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [subSearch, setSubSearch] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subSelected, setSubSelected] = useState<Set<string>>(new Set());

  // compose state
  const [composeToType, setComposeToType] = useState<'all_subscribers' | 'selected_subscribers' | 'custom'>('all_subscribers');
  const [composeCustomEmail, setComposeCustomEmail] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');

  // toast
  const [toast, setToast] = useState('');
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  // ── Loaders ──
  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (filterType !== 'all') q.set('type', filterType);
      if (filterRead === '0') q.set('isRead', '0');
      if (filterRead === '1') q.set('isRead', '1');
      if (filterStar) q.set('isStarred', '1');
      if (debouncedSearch) q.set('search', debouncedSearch);
      q.set('page', String(page)); q.set('limit', '20');
      const data = await apiFetch(`/admin/email/inbox?${q}`);
      setEmails(data.emails); setTotal(data.total); setUnreadCount(data.unreadCount);
      setTypeCounts(data.typeCounts || []); setTotalPages(data.totalPages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterType, filterRead, filterStar, debouncedSearch, page]);

  const loadSubscribers = useCallback(async () => {
    setSubLoading(true);
    try {
      const q = new URLSearchParams();
      if (subSearch) q.set('search', subSearch);
      q.set('limit', '100');
      const data = await apiFetch(`/admin/email/subscribers?${q}`);
      setSubscribers(data.subscribers); setSubTotal(data.total);
    } finally { setSubLoading(false); }
  }, [subSearch]);

  useEffect(() => { loadInbox(); }, [loadInbox]);
  useEffect(() => { if (tab === 'subscribers') loadSubscribers(); }, [tab, loadSubscribers]);
  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);

  // ── Email detail ──
  const openEmail = async (id: string) => {
    setSelectedId(id); setReplyMsg(''); setReplyContent(''); setNoteText('');
    try {
      const data = await apiFetch(`/admin/email/inbox/${id}`);
      setDetail(data.email); setNoteText(data.email.adminNote || '');
      setEmails(prev => prev.map(e => e._id === id ? { ...e, isRead: true } : e));
    } catch (e) { console.error(e); }
  };

  const handleStar = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const em = emails.find(x => x._id === id);
    if (!em) return;
    await apiFetch(`/admin/email/inbox/${id}`, { method: 'PATCH', body: JSON.stringify({ isStarred: !em.isStarred }) });
    setEmails(prev => prev.map(x => x._id === id ? { ...x, isStarred: !x.isStarred } : x));
    if (detail?._id === id) setDetail(d => d ? { ...d, isStarred: !d.isStarred } : d);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoá email này?')) return;
    await apiFetch(`/admin/email/inbox/${id}`, { method: 'DELETE' });
    setEmails(prev => prev.filter(x => x._id !== id));
    if (selectedId === id) { setSelectedId(null); setDetail(null); }
    showToast('🗑 Đã xoá email');
  };

  const handleBulk = async (action: string) => {
    if (!selected.size) return;
    await apiFetch('/admin/email/inbox/bulk', { method: 'PATCH', body: JSON.stringify({ ids: [...selected], action }) });
    setSelected(new Set());
    await loadInbox();
    showToast('✅ Đã cập nhật');
  };

  const handleReply = async () => {
    if (!detail || !replyContent.trim()) return;
    setReplying(true); setReplyMsg('');
    try {
      const data = await apiFetch(`/admin/email/reply/${detail._id}`, { method: 'POST', body: JSON.stringify({ content: replyContent }) });
      setReplyMsg('✅ ' + data.message); setReplyContent('');
    } catch (e: unknown) { setReplyMsg('❌ ' + (e instanceof Error ? e.message : 'Lỗi')); }
    finally { setReplying(false); }
  };

  const handleSaveNote = async () => {
    if (!detail) return;
    setSavingNote(true);
    try {
      await apiFetch(`/admin/email/inbox/${detail._id}`, { method: 'PATCH', body: JSON.stringify({ adminNote: noteText }) });
      setDetail(d => d ? { ...d, adminNote: noteText } : d);
      showToast('✅ Đã lưu ghi chú');
    } finally { setSavingNote(false); }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const selectAll = () => setSelected(emails.length === selected.size ? new Set() : new Set(emails.map(e => e._id)));

  // ── Compose ──
  const handleSend = async () => {
    if (!composeSubject.trim() || !composeContent.trim()) { setSendResult('❌ Vui lòng nhập tiêu đề và nội dung'); return; }
    setSending(true); setSendResult('');
    try {
      let toEmails: string[] = [];
      if (composeToType === 'custom') toEmails = composeCustomEmail.split(',').map(s => s.trim()).filter(Boolean);
      if (composeToType === 'selected_subscribers') toEmails = [...subSelected];
      const data = await apiFetch('/admin/email/send', {
        method: 'POST',
        body: JSON.stringify({ toType: composeToType, toEmails, subject: composeSubject, content: composeContent }),
      });
      setSendResult('✅ ' + data.message);
      setComposeSubject(''); setComposeContent(''); setComposeCustomEmail('');
    } catch (e: unknown) { setSendResult('❌ ' + (e instanceof Error ? e.message : 'Lỗi')); }
    finally { setSending(false); }
  };

  const getTypeCount = (t: string) => typeCounts.find(x => x._id === t);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AdminShell>
      <div className="h-full flex flex-col gap-4">

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium">{toast}</div>
        )}

        {/* Header */}
        <div className="bg-white border border-gray-200 px-6 py-4 flex justify-between items-center rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Email</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} chưa đọc</span>
            )}
          </div>
          <div className="flex gap-2">
            {['inbox','compose','subscribers'].map(t => (
              <button key={t} onClick={() => setTab(t as never)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5
                  ${tab===t ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {t==='inbox' && <><Inbox className="w-4 h-4"/>Hộp thư {unreadCount>0&&<span className="bg-red-400 text-white text-xs px-1.5 rounded-full ml-1">{unreadCount}</span>}</>}
                {t==='compose' && <><Send className="w-4 h-4"/>Soạn & Gửi</>}
                {t==='subscribers' && <><Users className="w-4 h-4"/>Subscriber ({subTotal||''})</>}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════ TAB: INBOX ═══════════════ */}
        {tab === 'inbox' && (
          <div className="flex-1 flex gap-4 min-h-0">

            {/* Left: list */}
            <div className="w-[380px] flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">

              {/* Filters */}
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
                    placeholder="Tìm kiếm..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Type filter */}
                  {[{v:'all',l:'Tất cả'},{v:'subscribe',l:'Tin tức'},{v:'contact',l:'Liên hệ'},{v:'career',l:'Công việc'}].map(({v,l})=>(
                    <button key={v} onClick={()=>{setFilterType(v);setPage(1);}}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${filterType===v?'bg-purple-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {l}{v!=='all' && getTypeCount(v) ? ` (${getTypeCount(v)?.unread??0}🔴/${getTypeCount(v)?.count??0})` : ''}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select value={filterRead} onChange={e=>{setFilterRead(e.target.value);setPage(1);}}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                    <option value="all">Tất cả</option><option value="0">Chưa đọc</option><option value="1">Đã đọc</option>
                  </select>
                  <button onClick={()=>{setFilterStar(!filterStar);setPage(1);}}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${filterStar?'bg-yellow-100 border-yellow-300 text-yellow-700':'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={loadInbox} className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bulk actions */}
              {selected.size > 0 && (
                <div className="px-3 py-2 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                  <span className="text-xs text-purple-700 font-medium">{selected.size} đã chọn</span>
                  <button onClick={()=>handleBulk('read')} className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50">Đã đọc</button>
                  <button onClick={()=>handleBulk('star')} className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50">⭐</button>
                  <button onClick={()=>handleBulk('delete')} className="text-xs px-2 py-1 bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100">Xoá</button>
                  <button onClick={()=>setSelected(new Set())} className="ml-auto text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5"/></button>
                </div>
              )}

              {/* Select all row */}
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                <button onClick={selectAll} className="text-gray-400 hover:text-gray-600">
                  {selected.size === emails.length && emails.length > 0 ? <CheckSquare className="w-4 h-4 text-purple-600"/> : <Square className="w-4 h-4"/>}
                </button>
                <span className="text-xs text-gray-400">Tổng {total} email</span>
              </div>

              {/* Email list */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {loading ? (
                  <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"/></div>
                ) : emails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
                    <Mail className="w-12 h-12 mb-2"/><p>Không có email nào</p>
                  </div>
                ) : emails.map(em => {
                  const meta = TYPE_META[em.type];
                  return (
                    <div key={em._id} onClick={()=>openEmail(em._id)}
                      className={`group p-3 cursor-pointer transition-colors hover:bg-gray-50
                        ${selectedId===em._id?'bg-purple-50 border-l-2 border-purple-500':''}
                        ${!em.isRead?'bg-blue-50/30':''}`}>
                      <div className="flex items-start gap-2">
                        <button onClick={e=>toggleSelect(em._id,e)} className="mt-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0">
                          {selected.has(em._id)?<CheckSquare className="w-4 h-4 text-purple-600"/>:<Square className="w-4 h-4"/>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {!em.isRead?<MailOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"/>:<Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>}
                            <span className={`text-sm truncate ${!em.isRead?'font-semibold text-gray-900':'text-gray-600'}`}>
                              {em.senderName||em.senderEmail}
                            </span>
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5 ${meta.bg} ${meta.color}`}>
                              {meta.icon}{meta.label}
                            </span>
                          </div>
                          <p className={`text-xs truncate mb-0.5 ${!em.isRead?'font-medium text-gray-800':'text-gray-500'}`}>{em.subject}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{em.content.slice(0,60)}</p>
                            <div className="flex items-center gap-1 ml-1">
                              <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDate(em.createdAt)}</span>
                              <button onClick={e=>handleStar(em._id,e)} className={`opacity-0 group-hover:opacity-100 p-0.5 rounded ${em.isStarred?'text-yellow-500 opacity-100':'text-gray-300 hover:text-yellow-400'}`}>
                                <Star className="w-3.5 h-3.5" fill={em.isStarred?'currentColor':'none'}/>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-3 border-t border-gray-100">
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4"/></button>
                  <span className="text-xs text-gray-500">{page}/{totalPages}</span>
                  <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight className="w-4 h-4"/></button>
                </div>
              )}
            </div>

            {/* Right: detail */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {!detail ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <Mail className="w-16 h-16 mb-4"/>
                  <p className="text-lg">Chọn một email để xem nội dung</p>
                </div>
              ) : (
                <>
                  {/* Detail header */}
                  <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-xl font-bold text-gray-900 flex-1 mr-4">{detail.subject}</h2>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={()=>handleStar(detail._id)} className={`p-2 rounded-lg hover:bg-gray-100 ${detail.isStarred?'text-yellow-500':'text-gray-400'}`}>
                          <Star className="w-5 h-5" fill={detail.isStarred?'currentColor':'none'}/>
                        </button>
                        <button onClick={()=>handleDelete(detail._id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-5 h-5"/>
                        </button>
                        <button onClick={()=>{setSelectedId(null);setDetail(null);}} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                          <X className="w-5 h-5"/>
                        </button>
                      </div>
                    </div>

                    {/* Sender info */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-700 font-bold text-sm">{(detail.senderName||detail.senderEmail).charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {detail.senderName && <p className="font-medium text-gray-900">{detail.senderName}</p>}
                          <p className="text-sm text-gray-500 flex items-center gap-1"><AtSign className="w-3 h-3"/>{detail.senderEmail}</p>
                          {detail.senderPhone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3"/>{detail.senderPhone}</p>}
                          {detail.position && <p className="text-sm text-gray-500 flex items-center gap-1"><Briefcase className="w-3 h-3"/>Vị trí: <strong>{detail.position}</strong></p>}
                          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${TYPE_META[detail.type].bg} ${TYPE_META[detail.type].color}`}>
                            {TYPE_META[detail.type].icon}{TYPE_META[detail.type].label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtFull(detail.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {/* Content */}
                    <div className="px-6 py-5">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{detail.content||'(Không có nội dung)'}</p>
                    </div>

                    {/* Admin note */}
                    <div className="mx-6 mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5"/>Ghi chú nội bộ</p>
                      <textarea rows={2} value={noteText} onChange={e=>setNoteText(e.target.value)}
                        placeholder="Thêm ghi chú cho email này..."
                        className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none placeholder:text-yellow-400"/>
                      <div className="flex justify-end mt-2">
                        <button onClick={handleSaveNote} disabled={savingNote}
                          className="text-xs px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-60">
                          {savingNote?'Đang lưu...':'Lưu ghi chú'}
                        </button>
                      </div>
                    </div>

                    {/* Reply box */}
                    {detail.type !== 'subscribe' && (
                      <div className="mx-6 mb-6 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                          <Reply className="w-4 h-4 text-gray-500"/>
                          <span className="text-sm font-medium text-gray-700">Trả lời tới: <span className="text-purple-600">{detail.senderEmail}</span></span>
                        </div>
                        <div className="p-4">
                          <textarea rows={4} value={replyContent} onChange={e=>setReplyContent(e.target.value)}
                            placeholder={`Nhập nội dung phản hồi tới ${detail.senderName||detail.senderEmail}...`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200 resize-none"/>
                          {replyMsg && <p className="text-sm mt-2">{replyMsg}</p>}
                          <div className="flex justify-end mt-3">
                            <button onClick={handleReply} disabled={replying||!replyContent.trim()}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50">
                              <Send className="w-4 h-4"/>{replying?'Đang gửi...':'Gửi phản hồi'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ TAB: COMPOSE ═══════════════ */}
        {tab === 'compose' && (
          <div className="flex-1 flex gap-4 min-h-0">
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2"><Send className="w-5 h-5 text-purple-600"/>Soạn & Gửi email</h2>

              {/* Người nhận */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Người nhận</label>
                <div className="flex gap-2 mb-3">
                  {([
                    {v:'all_subscribers',l:'Tất cả subscriber',desc:`Gửi cho tất cả (${subTotal} người)`},
                    {v:'selected_subscribers',l:'Subscriber đã chọn',desc:'Chọn ở tab Subscribers'},
                    {v:'custom',l:'Email tùy chỉnh',desc:'Nhập email thủ công'},
                  ] as const).map(({v,l,desc})=>(
                    <button key={v} onClick={()=>setComposeToType(v)}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm transition text-left
                        ${composeToType===v?'border-purple-500 bg-purple-50':'border-gray-200 hover:border-gray-300'}`}>
                      <p className={`font-medium ${composeToType===v?'text-purple-700':'text-gray-700'}`}>{l}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>

                {composeToType === 'custom' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email (phân cách bằng dấu phẩy)</label>
                    <input value={composeCustomEmail} onChange={e=>setComposeCustomEmail(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"/>
                  </div>
                )}

                {composeToType === 'selected_subscribers' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700">
                    {subSelected.size > 0
                      ? `✅ Đã chọn ${subSelected.size} subscriber từ tab Subscribers`
                      : '⚠️ Vào tab Subscribers, chọn các subscriber muốn gửi rồi quay lại đây'}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tiêu đề email *</label>
                <input value={composeSubject} onChange={e=>setComposeSubject(e.target.value)}
                  placeholder="Nhập tiêu đề..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"/>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nội dung *</label>
                <textarea rows={10} value={composeContent} onChange={e=>setComposeContent(e.target.value)}
                  placeholder="Nhập nội dung email..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"/>
              </div>

              {sendResult && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${sendResult.startsWith('✅')?'bg-green-50 text-green-700 border border-green-200':'bg-red-50 text-red-700 border border-red-200'}`}>
                  {sendResult}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleSend} disabled={sending}
                  className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50">
                  <Send className="w-4 h-4"/>{sending?'Đang gửi...':'Gửi email'}
                </button>
                <button onClick={()=>{setComposeSubject('');setComposeContent('');setComposeCustomEmail('');setSendResult('');}}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Xoá nội dung
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB: SUBSCRIBERS ═══════════════ */}
        {tab === 'subscribers' && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <input value={subSearch} onChange={e=>{setSubSearch(e.target.value);}} placeholder="Tìm email..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"/>
              </div>
              <span className="text-sm text-gray-500">Tổng: <strong>{subTotal}</strong> subscriber</span>
              {subSelected.size > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-purple-700 font-medium">Đã chọn {subSelected.size}</span>
                  <button onClick={()=>{setTab('compose');setComposeToType('selected_subscribers');}}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    <Send className="w-3.5 h-3.5"/>Gửi email cho nhóm này
                  </button>
                  <button onClick={()=>setSubSelected(new Set())} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {subLoading ? (
                <div className="flex justify-center py-16"><div className="w-7 h-7 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"/></div>
              ) : subscribers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-gray-400">
                  <Users className="w-12 h-12 mb-3"/><p>Chưa có subscriber nào</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left w-10">
                        <button onClick={()=>setSubSelected(subscribers.length===subSelected.size?new Set():new Set(subscribers.map(s=>s.email)))}>
                          {subSelected.size===subscribers.length&&subscribers.length>0?<CheckSquare className="w-4 h-4 text-purple-600"/>:<Square className="w-4 h-4"/>}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscribers.map(s=>(
                      <tr key={s._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button onClick={()=>setSubSelected(prev=>{const ns=new Set(prev);ns.has(s.email)?ns.delete(s.email):ns.add(s.email);return ns;})}>
                            {subSelected.has(s.email)?<CheckSquare className="w-4 h-4 text-purple-600"/>:<Square className="w-4 h-4 text-gray-400"/>}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </AdminShell>
  );
}