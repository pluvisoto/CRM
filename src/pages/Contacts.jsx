import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// import { initialContacts } from '../data/mockData'; // No longer needed
import ContactDetail from '../components/Contacts/ContactDetail';
import NewContactModal from '../components/Contacts/NewContactModal';
import { Search, Plus, MoreHorizontal, Mail, Phone } from 'lucide-react';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name');

      if (error) throw error;

      // Map DB snake_case to frontend camelCase
      const formatted = data.map(c => ({
        ...c,
        lastContact: c.last_contact
      }));
      setContacts(formatted);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactUpdated = (updatedContact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    setSelectedContact(updatedContact); // Update the selected contact view too
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container contacts-page">
      <div className="page-header">
        <h1>Contatos</h1>
        <div className="actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span className='btn-text'>Novo Contato</span>
          </button>
        </div>
      </div>

      <div className="contacts-table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Carregando Contatos...</div>
        ) : filteredContacts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Nenhum contato encontrado.</div>
        ) : (
          <table className="contacts-table">
            <thead>
              <tr>
                <th className="th-name">Nome</th>
                <th>Empresa</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Último Contato</th>
                <th className="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(contact => (
                <tr
                  key={contact.id}
                  className="contact-row"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="td-name">
                    <div className="avatar-small">{contact.name.charAt(0)}</div>
                    <div className="name-info">
                      <span className="name">{contact.name}</span>
                      <span className="role">{contact.role}</span>
                    </div>
                  </td>
                  <td>{contact.company}</td>
                  <td>
                    <div className="contact-method">
                      <Mail size={14} />
                      {contact.email}
                    </div>
                  </td>
                  <td>
                    <div className="contact-method">
                      <Phone size={14} />
                      {contact.phone}
                    </div>
                  </td>
                  <td>{contact.lastContact ? new Date(contact.lastContact).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="td-actions">
                    <button className="icon-btn-small" onClick={(e) => { e.stopPropagation(); }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ContactDetail
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdate={handleContactUpdated}
      />

      <NewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContactCreated={(newContact) => setContacts(prev => [...prev, newContact])}
      />

      <style>{`
        .contacts-page {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .actions {
          display: flex;
          gap: var(--spacing-md);
        }

        .search-box {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.625rem 0.875rem;
          border-radius: 10px;
          gap: var(--spacing-sm);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-box:focus-within {
          border-color: rgba(190, 242, 100, 0.5);
          background: rgba(190, 242, 100, 0.05);
          box-shadow: 0 0 0 3px rgba(190, 242, 100, 0.1);
        }

        .search-box input {
          border: none;
          outline: none;
          font-size: 0.9rem;
          width: 200px;
          background-color: transparent;
          color: var(--text-primary);
        }

        .search-icon {
          color: var(--text-secondary);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          background: linear-gradient(135deg, #bef264 0%, #a3e635 100%);
          color: #1a1a1a;
          padding: 0.625rem 1.25rem;
          border-radius: 10px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(190, 242, 100, 0.3);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(190, 242, 100, 0.4);
        }

        .contacts-table-container {
          background: linear-gradient(135deg, rgba(30, 30, 40, 0.6) 0%, rgba(20, 20, 30, 0.8) 100%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .contacts-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .contacts-table th {
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .contacts-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.9rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .contact-row:last-child td {
          border-bottom: none;
        }

        .contact-row:hover td {
          background: rgba(255, 255, 255, 0.05);
        }

        .td-name {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(190, 242, 100, 0.2) 0%, rgba(163, 230, 53, 0.1) 100%);
          color: #bef264;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          border: 2px solid rgba(190, 242, 100, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .contact-row:hover .avatar-small {
          transform: scale(1.1);
          box-shadow: 0 0 12px rgba(190, 242, 100, 0.3);
        }

        .name-info {
          display: flex;
          flex-direction: column;
        }

        .name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .role {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .contact-method {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }

        .icon-btn-small {
          padding: 0.5rem;
          border-radius: 8px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .icon-btn-small:hover {
          background: rgba(190, 242, 100, 0.1);
          border-color: rgba(190, 242, 100, 0.3);
          color: #bef264;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default Contacts;
