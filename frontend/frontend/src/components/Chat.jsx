import { useState, useRef, useEffect } from 'react';
import { askQuestion, uploadPaper } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Paperclip, Sparkles, Zap, FileText, Image, Mic, User, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThinkingAnimation = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px' }}>
        <style>{`
            @keyframes gemini-pulse {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.1); }
            }
            .gemini-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: linear-gradient(135deg, #4c8bfa, #a855f7);
                animation: gemini-pulse 1.4s infinite ease-in-out both;
            }
        `}</style>
        <div className="gemini-dot" style={{ animationDelay: '0s' }}></div>
        <div className="gemini-dot" style={{ animationDelay: '0.2s' }}></div>
        <div className="gemini-dot" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const WelcomeScreen = ({ username, onSuggestionClick }) => {
    const suggestions = [
        { icon: <Zap size={18} />, text: "Explain quantum computing in simple terms", delay: 0.1 },
        { icon: <FileText size={18} />, text: "Summarize the key points of the uploaded paper", delay: 0.2 },
        { icon: <Image size={18} />, text: "Generate a creative image description", delay: 0.3 },
        { icon: <Sparkles size={18} />, text: "Brainstorm research topics on AI ethics", delay: 0.4 },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '2rem',
                textAlign: 'center',
                color: '#e3e3e3',
                overflow: 'hidden' 
            }}
        >
            <motion.div variants={itemVariants}>
                <div style={{ 
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(76, 139, 250, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                    padding: '1.25rem',
                    borderRadius: '24px',
                    display: 'inline-flex',
                    border: '1px solid rgba(76, 139, 250, 0.2)',
                    boxShadow: '0 0 40px rgba(76, 139, 250, 0.1)'
                }}>
                    <Sparkles size={48} color="#4c8bfa" />
                </div>
            </motion.div>
            
            <motion.h1 
                variants={itemVariants}
                style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 700, 
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(to right, #4c8bfa, #a855f7, #ef4444)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.03em'
                }}
            >
                Hello, {username || 'Human'}
            </motion.h1>
            
            <motion.h2 
                variants={itemVariants}
                style={{ fontSize: '1.75rem', color: '#6b7280', fontWeight: 500, marginBottom: '4rem' }}
            >
                How can I help you today?
            </motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', width: '100%', maxWidth: '800px' }}>
                {suggestions.map((s, i) => (
                    <motion.button
                        key={i}
                        variants={itemVariants}
                        onClick={() => onSuggestionClick(s.text)}
                        whileHover={{ scale: 1.02, backgroundColor: '#1e1f24', borderColor: '#4c8bfa' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '1.25rem',
                            background: '#131418',
                            border: '1px solid #2d2e36',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            color: '#e3e3e3',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            height: '100%'
                        }}
                    >
                        <div style={{ 
                            padding: '10px', 
                            background: '#1e1f24', 
                            borderRadius: '50%', 
                            color: '#4c8bfa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {s.icon}
                        </div>
                        <span style={{ fontWeight: 500 }}>{s.text}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default function Chat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]); 
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await askQuestion(text, null);
            let answer = "I couldn't generate a response.";
            if (res && res.data) {
                 if (res.data.answer) answer = res.data.answer;
                 else if (typeof res.data === 'string') answer = res.data;
            }

            const aiMessage = { role: 'assistant', content: answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessages(prev => [...prev, { role: 'system', content: `Uploading ${file.name}...` }]);

        try {
            await uploadPaper(file);
            setMessages(prev => [...prev, { role: 'system', content: `✅ ${file.name} uploaded successfully.` }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: `❌ Failed to upload ${file.name}.` }]);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ height: '100vh', maxHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f1014', position: 'relative', overflow: 'hidden' }}>
            
            {/* Background Ambience */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                 <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(76, 139, 250, 0.08) 0%, rgba(15, 16, 20, 0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
                 <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(15, 16, 20, 0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 120px 0', zIndex: 1, scrollBehavior: 'smooth' }}>
                {messages.length === 0 ? (
                    <WelcomeScreen username={user?.username?.split(' ')[0]} onSuggestionClick={handleSend} />
                ) : (
                    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <AnimatePresence>
                        {messages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            const isSystem = msg.role === 'system';

                            if (isSystem) {
                                return (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', margin: '0.5rem 0', fontStyle: 'italic', background: '#1e1f24', padding: '0.5rem 1rem', borderRadius: '12px', alignSelf: 'center', width: 'fit-content' }}
                                    >
                                        {msg.content}
                                    </motion.div>
                                );
                            }

                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    style={{ 
                                        display: 'flex', 
                                        gap: '1.5rem',
                                        flexDirection: isUser ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    {/* Avatar */}
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: isUser ? 0 : 10 }}
                                        style={{ 
                                            width: '36px', 
                                            height: '36px', 
                                            borderRadius: '50%', 
                                            background: isUser ? '#e2e8f0' : 'linear-gradient(135deg, #4c8bfa 0%, #a855f7 100%)',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {isUser ? <User size={20} color="#0f1014" /> : <Sparkles size={20} color="#fff" />}
                                    </motion.div>

                                    {/* Message Content */}
                                    <div style={{ 
                                        flex: 1,
                                        maxWidth: '85%',
                                        background: isUser ? '#1e1f24' : 'transparent',
                                        padding: isUser ? '1rem 1.5rem' : '0.5rem 0',
                                        borderRadius: isUser ? '24px 24px 4px 24px' : '0',
                                        fontSize: '1rem',
                                        lineHeight: '1.7',
                                        color: '#e3e3e3'
                                    }}>
                                        {isUser ? (
                                            msg.content
                                        ) : (
                                            <div>
                                                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                        </AnimatePresence>

                        {loading && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}
                            >
                                <div style={{ 
                                    width: '36px', 
                                    height: '36px', 
                                    borderRadius: '50%', 
                                    background: 'linear-gradient(135deg, #4c8bfa 0%, #a855f7 100%)',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    flexShrink: 0
                                }}>
                                    <Sparkles size={20} color="#fff" />
                                </div>
                                <ThinkingAnimation />
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Gemini Style) */}
            <div style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                width: '100%', 
                padding: '1.5rem 2rem 2rem 2rem',
                background: 'linear-gradient(to top, #0f1014 85%, rgba(15, 16, 20, 0) 100%)',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 10,
                pointerEvents: 'none'
            }}>
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    style={{ 
                        width: '100%', 
                        maxWidth: '800px', 
                        background: '#1e1f24', 
                        borderRadius: '3rem', 
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        border: '1px solid #2d2e36',
                        pointerEvents: 'auto'
                    }}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                        accept=".pdf,.txt"
                    />
                    
                    <motion.button 
                        whileHover={{ scale: 1.1, background: '#2d2e36' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current.click()}
                        style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '50%', 
                            border: 'none', 
                            background: 'transparent', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            color: '#e3e3e3',
                            transition: 'background 0.2s'
                        }}
                        title="Upload file"
                    >
                        <Paperclip size={20} />
                    </motion.button>
                    
                    <input 
                        type="text" 
                        placeholder="Ask anything..." 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                        style={{ 
                            flex: 1, 
                            border: 'none', 
                            background: 'transparent', 
                            outline: 'none', 
                            fontSize: '1rem', 
                            color: '#e3e3e3',
                            padding: '0 0.5rem',
                            fontFamily: 'inherit'
                        }} 
                    />

                    {input.trim() ? (
                        <motion.button 
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSend()}
                            disabled={loading}
                            style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '50%', 
                                border: 'none', 
                                background: '#e3e3e3', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer',
                                color: '#0f1014'
                            }}
                        >
                            <ArrowUp size={24} strokeWidth={2.5} />
                        </motion.button>
                    ) : (
                       <motion.button 
                            whileHover={{ scale: 1.1, background: '#2d2e36' }}
                            style={{ 
                                width: '44px', 
                                height: '44px', 
                                borderRadius: '50%', 
                                border: 'none', 
                                background: 'transparent', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'not-allowed',
                                color: '#6b7280'
                            }}
                        >
                            <Mic size={22} />
                        </motion.button>
                    )}
                </motion.div>
            </div>
            
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ 
                    position: 'absolute', 
                    bottom: '0.5rem', 
                    width: '100%', 
                    textAlign: 'center', 
                    fontSize: '0.7rem', 
                    color: '#6b7280',
                    paddingBottom: '0.5rem',
                    pointerEvents: 'none',
                    zIndex: 20
                }}
            >
                AI can make mistakes. Verify important information.
            </motion.div>
        </div>
    );
}
