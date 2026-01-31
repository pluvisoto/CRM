import React, { useState } from 'react';
import { Search, MessageCircle, Instagram } from 'lucide-react';

const ConversationList = ({ conversations, selectedId, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, whatsapp, instagram

    const filtered = conversations.filter(c => {
        const matchesSearch = c.contact_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || c.platform === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="conv-list-container">
            <div className="conv-header">
                <h2>Mensagens</h2>
                <div className="filter-tabs">
                    <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todos</button>
                    <button className={`tab ${filter === 'whatsapp' ? 'active' : ''}`} onClick={() => setFilter('whatsapp')}><MessageCircle size={14} /></button>
                    <button className={`tab ${filter === 'instagram' ? 'active' : ''}`} onClick={() => setFilter('instagram')}><Instagram size={14} /></button>
                </div>
                <div className="search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                        placeholder="Buscar conversa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="conv-items">
                {filtered.map(conv => (
                    <div
                        key={conv.id}
                        className={`conv-item ${selectedId === conv.id ? 'selected' : ''}`}
                        onClick={() => onSelect(conv)}
                    >
                        <div className="avatar">
                            {conv.contact_name.charAt(0)}
                            <div className={`platform-badge ${conv.platform}`}>
                                {conv.platform === 'whatsapp' ? <MessageCircle size={10} color="white" /> : <Instagram size={10} color="white" />}
                            </div>
                        </div>
                        <div className="conv-info">
                            <div className="conv-top">
                                <span className="name">{conv.contact_name}</span>
                                <span className="time">{conv.time}</span>
                            </div>
                            <div className="conv-bottom">
                                <span className="last-msg">{conv.last_message}</span>
                                {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .conv-list-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .conv-header {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .conv-header h2 { font-size: 1.25rem; font-weight: 700; }

                .filter-tabs {
                    display: flex;
                    gap: 0.5rem;
                }
                .tab {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    background: transparent;
                    color: var(--text-secondary);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex; justify-content: center; align-items: center;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }
                .tab:hover { background: var(--bg-hover); }
                .tab.active { background: var(--primary); color: black; border-color: var(--primary); }

                .search-bar {
                    position: relative;
                }
                .search-icon {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                }
                .search-bar input {
                    width: 100%;
                    padding: 0.6rem 0.6rem 0.6rem 2.2rem;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    color: white;
                }

                .conv-items {
                    flex: 1;
                    overflow-y: auto;
                }

                .conv-item {
                    display: flex;
                    padding: 1rem;
                    cursor: pointer;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    transition: background 0.2s;
                }
                .conv-item:hover { background: var(--bg-hover); }
                .conv-item.selected { background: rgba(180, 240, 58, 0.08); border-right: 3px solid var(--primary); }

                .avatar {
                    width: 40px; height: 40px;
                    background: #333;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700; color: #fff;
                    margin-right: 12px;
                    position: relative;
                }
                
                .platform-badge {
                    position: absolute;
                    bottom: -2px; right: -2px;
                    width: 18px; height: 18px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid var(--bg-secondary);
                }
                .platform-badge.whatsapp { background: #25D366; }
                .platform-badge.instagram { background: linear-gradient(45deg, #f09433, #d6249f, #285AEB); }

                .conv-info { flex: 1; overflow: hidden; }
                
                .conv-top { display: flex; justify-content: space-between; margin-bottom: 4px; }
                .name { font-weight: 600; font-size: 0.95rem; }
                .time { font-size: 0.75rem; color: var(--text-muted); }

                .conv-bottom { display: flex; justify-content: space-between; align-items: center; }
                .last-msg { 
                    font-size: 0.85rem; color: var(--text-secondary); 
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    max-width: 180px;
                }
                .unread-badge {
                    background: var(--primary);
                    color: black;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default ConversationList;
