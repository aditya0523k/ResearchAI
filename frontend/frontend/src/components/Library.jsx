import { useState, useRef, useEffect } from 'react';
import { uploadPaper, getPapers, summarizePaper } from '../services/api';
import { UploadCloud, FileText, Wand2, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function Library() {
    const [papers, setPapers] = useState([]);
    const [status, setStatus] = useState('idle'); 
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const fileInput = useRef(null);

    useEffect(() => {
        loadPapers();
    }, []);

    const loadPapers = async () => {
        try {
            const res = await getPapers();
            setPapers(res.data.papers);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatus('uploading');
        try {
            await uploadPaper(file);
            setStatus('success');
            await loadPapers(); // Refresh list
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleSummarize = async (filename) => {
        setSelectedPaper(filename);
        setLoadingSummary(true);
        setSummary('');
        try {
            const res = await summarizePaper({ filename });
            setSummary(res.data.summary);
        } catch (error) {
            console.error(error);
            setSummary('Error generating summary. Please try again.');
        } finally {
            setLoadingSummary(false);
        }
    };

    // Close modal on click outside
    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedPaper(null);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header Section */}
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Knowledge Base</h1>
                <p style={{ color: '#6b7280' }}>Manage your research papers, upload new documents, and generate instant summaries using AI.</p>
            </div>

            {/* Upload Area */}
            <div
                className="glass-card"
                style={{
                    padding: '3rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px dashed #e5e7eb',
                    background: status === 'uploading' ? '#f3f4f6' : '#ffffff',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={() => status !== 'uploading' && fileInput.current.click()}
            >
                <input
                    type="file"
                    ref={fileInput}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.txt"
                />

                <div style={{ position: 'relative', zIndex: 10 }}>
                    {status === 'idle' && (
                        <>
                            <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <UploadCloud size={32} color="#3b82f6" />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Click to upload or drag and drop</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>PDF or TXT (MAX. 10MB)</p>
                        </>
                    )}

                    {status === 'uploading' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Loader2 size={48} color="#3b82f6" className="spin-animation" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#3b82f6' }}>Uploading & Indexing...</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>This may take a moment</p>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .spin-animation { animation: spin 1s linear infinite; }`}</style>
                        </div>
                    )}

                    {status === 'success' && (
                        <>
                            <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <CheckCircle size={32} color="#10b981" />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#10b981' }}>Upload Successful!</h3>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <AlertCircle size={32} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#ef4444' }}>Upload Failed</h3>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>Please ensure the file is valid and try again.</p>
                        </>
                    )}
                </div>
            </div>

            {/* Papers List */}
            <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>Uploaded Papers</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {papers.length === 0 ? (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                            No papers in your library yet. Upload one above to get started.
                        </div>
                    ) : (
                        papers.map((paper, index) => (
                            <div key={index} className="glass-card"
                                style={{
                                    padding: '1.25rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={24} color="#4b5563" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.90rem', marginBottom: '0.25rem' }}>{paper}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Added recently</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSummarize(paper)}
                                    className="btn-secondary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.8rem',
                                        borderRadius: '20px'
                                    }}
                                >
                                    <Wand2 size={14} /> Generate Summary
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Summary Modal */}
            {selectedPaper && (
                <div
                    onClick={handleModalClick}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div
                        className="glass-panel"
                        style={{
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            background: '#ffffff',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '16px',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>Paper Summary</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '4px' }}>{selectedPaper}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPaper(null)}
                                style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                            >
                                <X size={18} color="#4b5563" />
                            </button>
                        </div>

                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            {loadingSummary ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                                    <Loader2 size={40} color="#3b82f6" className="spin-animation" style={{ marginBottom: '1.5rem' }} />
                                    <p style={{ fontWeight: 500, color: '#374151' }}>Analyzing document content...</p>
                                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>AI is extracting key insights, methodology, and conclusions.</p>
                                </div>
                            ) : (
                                <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#374151', whiteSpace: 'pre-wrap' }}>
                                    {summary}
                                </div>
                            )}
                        </div>

                        {!loadingSummary && (
                            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', background: '#f9fafb', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setSelectedPaper(null)} className="btn-secondary">Close</button>
                                <button className="btn-primary" onClick={() => navigator.clipboard.writeText(summary)}>Copy Summary</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
