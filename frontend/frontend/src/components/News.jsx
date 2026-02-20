import { useState, useEffect } from 'react';
import { getNews } from '../services/api';
import { Newspaper, ExternalLink } from 'lucide-react';

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await getNews('Academic Research');
                setNews(res.data.articles);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Newspaper size={20} /> Latest Research News
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {loading ? (
                    <p>Loading news...</p>
                ) : (
                    news.map((item, index) => (
                        <div key={index} className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <h4 style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>{item.title}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1 }}>
                                {item.content ? item.content.substring(0, 100) + '...' : 'No description available.'}
                            </p>
                            <a
                                href={item.url} target="_blank" rel="noreferrer"
                                style={{
                                    textDecoration: 'none', color: 'var(--accent-color)',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    fontWeight: 500
                                }}
                            >
                                Read More <ExternalLink size={14} />
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
