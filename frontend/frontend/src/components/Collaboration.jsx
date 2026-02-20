import { useState, useEffect } from 'react';
import { createRoom, getRoom, addMessage, getMessages } from '../services/api';
import { Users, MessageSquare, Send } from 'lucide-react';

export default function Collaboration() {
    const [roomId, setRoomId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [username, setUsername] = useState('Researcher');
    const [isInRoom, setIsInRoom] = useState(false);
    const [joinInput, setJoinInput] = useState('');

    useEffect(() => {
        let interval;
        if (isInRoom && roomId) {
            fetchMessages();
            interval = setInterval(fetchMessages, 3000); // Poll every 3s
        }
        return () => clearInterval(interval);
    }, [isInRoom, roomId]);

    const fetchMessages = async () => {
        try {
            const res = await getMessages(roomId);
            setMessages(res.data.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) return;
        try {
            const res = await createRoom(roomName);
            setRoomId(res.data.room_id);
            setIsInRoom(true);
            setMessages([]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleJoinRoom = async () => {
        if (!joinInput.trim()) return;
        try {
            const res = await getRoom(joinInput);
            if (res.data) {
                setRoomId(joinInput);
                setRoomName(res.data.name);
                setIsInRoom(true);
                fetchMessages();
            }
        } catch (error) {
            alert("Room not found");
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            await addMessage(roomId, newMessage, username);
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error(error);
        }
    };

    if (!isInRoom) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
                <Users size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
                <h2 style={{ marginBottom: '2rem' }}>Collaboration Space</h2>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3>Create New Room</h3>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Room Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                            <button className="btn-primary" onClick={handleCreateRoom}>Create</button>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3>Join Existing Room</h3>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Enter Room ID"
                                value={joinInput}
                                onChange={(e) => setJoinInput(e.target.value)}
                            />
                            <button className="btn-secondary" onClick={handleJoinRoom}>Join</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={20} color="var(--accent-color)" />
                    <h3>{roomName}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>ID: {roomId}</span>
                </div>
                <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }} onClick={() => setIsInRoom(false)}>Leave</button>
            </div>

            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                    <p style={{ textAlign: 'center', opacity: 0.5 }}>No messages yet. Start the discussion!</p>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.user === username ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            background: msg.user === username ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                            padding: '0.8rem',
                            borderRadius: '8px'
                        }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px' }}>{msg.user}</div>
                            <div>{msg.content}</div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Your Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: '0.5rem', fontSize: '0.9rem', width: '150px' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        style={{ flex: 1 }}
                    />
                    <button className="btn-primary" onClick={handleSendMessage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
