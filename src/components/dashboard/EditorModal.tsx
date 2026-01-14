import { Manhwa } from '@/types';
import { cn } from '@/lib/utils';
import { X, Save, Trash2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Manhwa;
    onSave: (data: Partial<Manhwa>) => void;
    onDelete?: (id: string) => void;
}

export function EditorModal({ isOpen, onClose, initialData, onSave, onDelete }: EditorModalProps) {
    const [formData, setFormData] = useState<Partial<Manhwa>>({});
    const [activeTab, setActiveTab] = useState<'details' | 'chapters'>('details');
    const [newChapterFile, setNewChapterFile] = useState<File | null>(null);
    const [manualChapterUrl, setManualChapterUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'Ongoing',
                type: 'Manhwa',
                genres: [],
                last_chapter: 1,
                chapters: []
            });
        }
        setActiveTab('details');
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewChapterFile(e.target.files[0]);
        }
    };


    const handleAddChapter = async (e: React.FormEvent) => {
        e.preventDefault();
        const newChapterNumber = (formData.chapters?.length || 0) + 1;

        let fileUrl = undefined;
        let fileName = newChapterFile?.name;

        // Try Upload to Supabase
        if (newChapterFile) {
            try {
                // Sanitize filename
                const safeName = `${Date.now()}-${newChapterFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

                const { data, error } = await supabase.storage
                    .from('chapters')
                    .upload(`${safeName}`, newChapterFile);

                if (error) throw error;

                if (data) {
                    const { data: publicUrlData } = supabase.storage
                        .from('chapters')
                        .getPublicUrl(`${safeName}`);

                    fileUrl = publicUrlData.publicUrl;
                }
            } catch (err) {
                console.warn('Supabase upload failed, falling back to local object URL', err);
                // Fallback to local Blob URL for demo
                fileUrl = URL.createObjectURL(newChapterFile);
            }
        }

        const newChapter = {
            id: `new-${Date.now()}`,
            number: newChapterNumber,
            title: `Chapter ${newChapterNumber}`,
            releasedAt: new Date().toISOString(),
            contentUrl: fileUrl,
            fileName: fileName
        };

        setFormData({
            ...formData,
            chapters: [newChapter, ...(formData.chapters || [])],
            last_chapter: newChapterNumber
        });
        setNewChapterFile(null);

        // Reset file input if exists
        const fileInput = document.getElementById('chapter-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleDeleteChapter = (chapterId: string) => {
        setFormData({
            ...formData,
            chapters: formData.chapters?.filter(c => c.id !== chapterId)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#16191e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0b0d10]/50 shrink-0">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {initialData ? 'Edit Manhwa' : 'Add New Manhwa'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 shrink-0">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'details' ? 'bg-white/5 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab('chapters')}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'chapters' ? 'bg-white/5 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        Chapters ({formData.chapters?.length || 0})
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {activeTab === 'details' ? (
                        <form id="details-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Quick Import</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        id="import-url"
                                        className="flex-1 px-4 py-2 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 outline-none text-sm"
                                        placeholder="Paste manhwa URL (Asura, Reaper, etc.)"
                                    />
                                    <button
                                        type="button"
                                        disabled={isScraping}
                                        onClick={async () => {
                                            const urlInput = document.getElementById('import-url') as HTMLInputElement;
                                            const url = urlInput.value;
                                            if (!url) return;

                                            setIsScraping(true);
                                            try {
                                                const res = await fetch('/api/scrape', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ url })
                                                });

                                                const data = await res.json();

                                                if (!res.ok) {
                                                    throw new Error(data.error || `HTTP error! status: ${res.status}`);
                                                }

                                                setFormData({
                                                    ...formData,
                                                    title: data.title || formData.title,
                                                    description: data.description || formData.description,
                                                    thumbnail: data.thumbnail || formData.thumbnail,
                                                    chapters: data.chapters && data.chapters.length > 0 ? data.chapters : formData.chapters,
                                                    last_chapter: data.chapters && data.chapters.length > 0 ? data.chapters[0].number : formData.last_chapter
                                                });
                                                alert(`Berhasil! ${data.chapters?.length || 0} Chapter juga ikut ter-import.`);
                                            } catch (err: any) {
                                                console.error('Import failed:', err);
                                                alert(`Gagal Import: ${err.message}`);
                                            } finally {
                                                setIsScraping(false);
                                            }
                                        }}
                                        className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isScraping ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                <span>Importing...</span>
                                            </>
                                        ) : (
                                            'Import'
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500">Auto-fills Title, Description, and Thumbnail from URL tags.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="e.g. Solo Leveling"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                                    <select
                                        value={formData.status || 'Ongoing'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 outline-none"
                                    >
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</label>
                                    <select
                                        value={formData.type || 'Manhwa'}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 outline-none"
                                    >
                                        <option value="Manhwa">Manhwa</option>
                                        <option value="Manhua">Manhua</option>
                                        <option value="Manga">Manga</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 outline-none h-32 resize-none"
                                    placeholder="Synopsis..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thumbnail URL</label>
                                    <input
                                        type="url"
                                        value={formData.thumbnail || ''}
                                        onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Chapter</label>
                                    <input
                                        type="number"
                                        value={formData.last_chapter || 0}
                                        onChange={e => setFormData({ ...formData, last_chapter: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 outline-none"
                                    />
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Manage Chapters</h3>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Add New Chapter</h4>

                                <div className="space-y-4">
                                    {/* Option 1: File Upload */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-xs text-gray-500">Option 1: Upload File (PDF/Images)</label>
                                            <input
                                                id="chapter-upload"
                                                type="file"
                                                onChange={handleFileChange}
                                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                accept="image/*,application/pdf"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddChapter}
                                            disabled={!newChapterFile}
                                            className="px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-10"
                                        >
                                            + Upload
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 py-2">
                                        <div className="flex-1 h-px bg-white/5"></div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">OR</span>
                                        <div className="flex-1 h-px bg-white/5"></div>
                                    </div>

                                    {/* Option 2: URL Link */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-xs text-gray-500">Option 2: Add via Link (URL)</label>
                                            <input
                                                type="url"
                                                value={manualChapterUrl}
                                                onChange={(e) => setManualChapterUrl(e.target.value)}
                                                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm focus:border-primary/50 outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!manualChapterUrl) return;
                                                const nextNum = (formData.chapters?.length || 0) + 1;
                                                const newChapter = {
                                                    id: `manual-${Date.now()}`,
                                                    number: nextNum,
                                                    title: `Chapter ${nextNum}`,
                                                    releasedAt: new Date().toISOString(),
                                                    contentUrl: manualChapterUrl,
                                                    fileName: 'Manual Link'
                                                };
                                                setFormData({
                                                    ...formData,
                                                    chapters: [newChapter, ...(formData.chapters || [])],
                                                    last_chapter: nextNum
                                                });
                                                setManualChapterUrl('');
                                            }}
                                            className="px-4 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all h-10"
                                        >
                                            + Add URL
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chapter List</h4>
                                {formData.chapters && formData.chapters.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Hapus semua chapter?')) {
                                                setFormData({ ...formData, chapters: [] });
                                            }
                                        }}
                                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {formData.chapters?.map((chapter) => (
                                    <div key={chapter.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div>
                                            <p className="font-bold text-white">{chapter.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>Released: {new Date(chapter.releasedAt).toLocaleDateString()}</span>
                                                {chapter.fileName && (
                                                    <span className="px-2 py-0.5 bg-white/10 rounded flex items-center gap-1">
                                                        📄 {chapter.fileName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteChapter(chapter.id)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) || <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg">No chapters added yet</div>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-[#0b0d10]/50 flex items-center justify-between shrink-0">
                    {initialData && onDelete ? (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure?')) onDelete(initialData.id!);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    ) : <div />}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
