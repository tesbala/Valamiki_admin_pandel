'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, FileText, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: Date | null;
}

const initForm = { title: '', description: '', imageUrl: '', isPublished: true };

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => {
        const r = d.data();
        return {
          id: d.id,
          title: r.title ?? '',
          description: r.description ?? '',
          imageUrl: r.imageUrl ?? '',
          isPublished: r.isPublished ?? true,
          createdAt: r.createdAt?.toDate() ?? null,
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(initForm);
    setImgError(false);
    setShowModal(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditId(p.id);
    setForm({ title: p.title, description: p.description, imageUrl: p.imageUrl, isPublished: p.isPublished });
    setImgError(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Title is required.');
    setSaving(true);
    try {
      const data = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        isPublished: form.isPublished,
      };
      if (editId) {
        await updateDoc(doc(db, 'blog', editId), { ...data, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'blog'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }
      setShowModal(false);
    } catch (e) {
      alert('Failed to save: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, 'blog', id)); }
    catch (e) { alert('Failed to delete: ' + (e instanceof Error ? e.message : String(e))); }
    setDeleteId(null);
  };

  const togglePublish = async (p: BlogPost) => {
    try { await updateDoc(doc(db, 'blog', p.id), { isPublished: !p.isPublished }); }
    catch (e) { console.error(e); }
  };

  const formatDate = (d: Date | null) =>
    d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      <Header title="Blog" />
      <div className="p-6">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 font-medium">
              {posts.length} post{posts.length !== 1 ? 's' : ''} · {posts.filter(p => p.isPublished).length} published
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} /> New Post
          </button>
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
            <FileText size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">No blog posts yet</p>
            <p className="text-xs text-gray-300 mt-1">Click "New Post" to write your first one.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((p) => (
              <div key={p.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-opacity ${!p.isPublished ? 'opacity-60' : ''}`}>

                {/* Image */}
                <div className="h-44 bg-gray-50 relative overflow-hidden">
                  {p.imageUrl && !imgError ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <ImageIcon size={36} />
                    </div>
                  )}
                  {/* Status badge */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${p.isPublished ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-white'}`}>
                    {p.isPublished ? '● Live' : '○ Draft'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{p.title}</h3>
                  {p.description && (
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-3 leading-relaxed flex-1">{p.description}</p>
                  )}
                  <p className="text-[11px] text-gray-300 mt-3">{formatDate(p.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-gray-50 flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(p)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${p.isPublished ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    {p.isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                    {p.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ───────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={() => !saving && setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Title <span className="text-red-400">*</span></label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 5 Tips for Fresh Grocery Shopping"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Write the full blog content here…"
                  rows={6}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none leading-relaxed"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setImgError(false); }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                {/* Preview */}
                {form.imageUrl && !imgError && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  </div>
                )}
                {imgError && (
                  <p className="text-xs text-red-400 mt-1.5">⚠️ Could not load image from this URL.</p>
                )}
              </div>

              {/* Publish toggle */}
              <label className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Publish Post</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Visible to customers on the website</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                  className={`relative inline-flex w-10 h-5 rounded-full transition-colors ${form.isPublished ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => !saving && setShowModal(false)}
                  disabled={saving}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Publish Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Post?</h3>
            <p className="text-sm text-gray-500 mb-6">This blog post will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
