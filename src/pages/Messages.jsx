import React, { useState, useEffect } from 'react';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import { supabase } from '../lib/supabaseClient';

const Messages = () => {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    contacts (name)
                `)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            const formatted = data.map(c => ({
                id: c.id,
                contact_name: c.contacts?.name || 'Desconhecido',
                platform: c.platform,
                last_message: c.last_message,
                unread: c.unread_count,
                time: new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

            setConversations(formatted);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="messages-container">
            <div className="conversations-sidebar">
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversation?.id}
                    onSelect={setSelectedConversation}
                />
            </div>
            <div className="chat-area">
                {selectedConversation ? (
                    <ChatWindow conversation={selectedConversation} />
                ) : (
                    <div className="empty-state">
                        <h3>Selecione uma conversa</h3>
                        <p>Escolha um contato para iniciar o atendimento.</p>
                    </div>
                )}
            </div>

            <style>{`
                .messages-container {
                    display: flex;
                    height: 100%;
                    width: 100%;
                    background-color: var(--bg-primary);
                    overflow: hidden;
                }

                .conversations-sidebar {
                    width: 350px;
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(135deg, rgba(30, 30, 40, 0.6) 0%, rgba(20, 20, 30, 0.8) 100%);
                    backdrop-filter: blur(10px);
                }

                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 20px 20px;
                    background-color: var(--bg-primary);
                    position: relative;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-secondary);
                    opacity: 0.6;
                }

                .empty-state h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

               .empty-state p {
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
};

export default Messages;
