import React, { useState, useEffect } from 'react';
import { Send, Phone, MoreVertical, Instagram, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ChatWindow = ({ conversation }) => {
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);

    // Fetch messages when conversation changes
    useEffect(() => {
        if (conversation?.id) {
            fetchMessages();
        }
    }, [conversation]);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversation.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const formatted = data.map(m => ({
                id: m.id,
                content: m.content,
                direction: m.direction,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(formatted);
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        const content = messageInput;
        setMessageInput(''); // Optimistic clear

        // Optimistic UI Update
        const optimisticMsg = {
            id: Date.now(),
            content: content,
            direction: 'outbound',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            // 1. Insert message
            const { error: msgError } = await supabase
                .from('messages')
                .insert([{
                    conversation_id: conversation.id,
                    content: content,
                    direction: 'outbound',
                    status: 'sent'
                }]);

            if (msgError) throw msgError;

            // 2. Update conversation last_message
            await supabase
                .from('conversations')
                .update({
                    last_message: content,
                    last_message_at: new Date().toISOString()
                })
                .eq('id', conversation.id);

        } catch (err) {
            console.error('Error sending message:', err);
            alert('Erro ao enviar mensagem.');
        }
    };

    return (
        <div className="window-container">
            <div className="window-header">
                <div className="header-info">
                    <div className="avatar-small">{conversation.contact_name.charAt(0)}</div>
                    <div>
                        <div className="contact-name">
                            {conversation.contact_name}
                            <span className="platform-tag">
                                {conversation.platform === 'whatsapp' ? <MessageCircle size={12} /> : <Instagram size={12} />}
                                {conversation.platform}
                            </span>
                        </div>
                        <div className="status">Online</div>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn"><Phone size={18} /></button>
                    <button className="icon-btn"><MoreVertical size={18} /></button>
                </div>
            </div>

            <div className="messages-body">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-row ${msg.direction}`}>
                        <div className="message-bubble">
                            {msg.content}
                            <span className="msg-time">{msg.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            <form className="input-area" onSubmit={handleSend}>
                <input
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="send-btn">
                    <Send size={18} />
                </button>
            </form>

            <style>{`
                .window-container { display: flex; flex-direction: column; height: 100%; }

                .window-header {
                    padding: 0.75rem 1.5rem;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-color);
                    display: flex; justify-content: space-between; align-items: center;
                }

                .header-info { display: flex; align-items: center; gap: 1rem; }
                .avatar-small {
                    width: 36px; height: 36px; background: #444; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center; color: white;
                }
                .contact-name { font-weight: 700; display: flex; align-items: center; gap: 8px; }
                .platform-tag {
                    font-size: 0.7rem; font-weight: 400; background: rgba(255,255,255,0.1);
                    padding: 2px 6px; border-radius: 4px; display: flex; align-items: center; gap: 4px;
                    text-transform: capitalize;
                }
                .status { font-size: 0.8rem; color: var(--success); }

                .header-actions { display: flex; gap: 0.5rem; }
                .icon-btn {
                    padding: 0.5rem; background: transparent; border: none; color: var(--text-secondary);
                    cursor: pointer; border-radius: 50%;
                }
                .icon-btn:hover { background: var(--bg-hover); color: white; }

                .messages-body {
                    flex: 1;
                    padding: 1.5rem;
                    display: flex; flex-direction: column; gap: 0.5rem;
                    overflow-y: auto;
                }

                .message-row { display: flex; width: 100%; }
                .message-row.outbound { justify-content: flex-end; }
                .message-row.inbound { justify-content: flex-start; }

                .message-bubble {
                    max-width: 60%;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    position: relative;
                    font-size: 0.95rem;
                    line-height: 1.4;
                }

                .outbound .message-bubble {
                    background-color: var(--primary);
                    color: black;
                    border-bottom-right-radius: 2px;
                }

                .inbound .message-bubble {
                    background-color: var(--bg-secondary);
                    color: white;
                    border: 1px solid var(--border-color);
                    border-bottom-left-radius: 2px;
                }

                .msg-time {
                    display: block;
                    font-size: 0.65rem;
                    opacity: 0.7;
                    text-align: right;
                    margin-top: 4px;
                }

                .input-area {
                    padding: 1rem 1.5rem;
                    background: var(--bg-secondary);
                    border-top: 1px solid var(--border-color);
                    display: flex; gap: 1rem;
                }
                .input-area input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: white;
                }
                .input-area input:focus { outline: none; border-color: var(--primary); }

                .send-btn {
                    width: 45px; height: 45px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: black;
                    border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: transform 0.1s;
                }
                .send-btn:hover { transform: scale(1.05); }
                .send-btn:active { transform: scale(0.95); }

            `}</style>
        </div>
    );
};

export default ChatWindow;
