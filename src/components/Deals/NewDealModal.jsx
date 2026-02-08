
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import financeService from '../../services/financeService';
import { logActivity } from '../../utils/logger';


const NewDealModal = ({ isOpen, onClose, onDealCreated, columns, pipelineType = 'Receptivo' }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        company: '',
        contact_name: '',
        value: '597', // Default price
        column_id: columns[0]?.id || '',
        instagram: '',
        whatsapp: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const startColumn = formData.column_id || columns[0]?.id;

            const { data, error } = await supabase
                .from('central_vendas')
                .insert([
                    {
                        empresa_cliente: formData.company,
                        nome_contato: formData.contact_name,
                        faturamento_mensal: parseFloat(formData.value || 0),
                        tipo_pipeline: pipelineType === 'Ativo' ? 'Ativo_Diagnostico' : 'Receptivo',
                        stage: startColumn,
                        created_by: user?.id,
                        instagram: formData.instagram,
                        whatsapp: formData.whatsapp,
                        created_at: formData.created_at ? new Date(formData.created_at).toISOString() : undefined
                    }
                ])
                .select();

            if (error) throw error;

            if (onDealCreated && data && data.length > 0) {
                const newDeal = data[0];
                onDealCreated({
                    id: newDeal.id,
                    title: newDeal.empresa_cliente,
                    company: newDeal.empresa_cliente,
                    contact_name: newDeal.nome_contato,
                    value: newDeal.faturamento_mensal,
                    faturamento: newDeal.faturamento_mensal,
                    columnId: newDeal.stage,
                    instagram: newDeal.instagram,
                    whatsapp: newDeal.whatsapp,
                    user_id: newDeal.created_by,
                    tags: []
                });

                // --- FINANCIAL INTEGRATION TRIGGER ---
                const selectedColumn = columns.find(c => c.id === startColumn);
                const colName = (selectedColumn?.title || selectedColumn?.name || '').toUpperCase();

                // Closure stages usually contain "FECHA", "GANHO", "WON" or have status "won"
                const isWon = colName.includes('FECHA') || colName.includes('GANHO') || colName.includes('WON') || selectedColumn?.status === 'won';

                console.log(`[DEAL CREATE] Stage: ${colName}, isWon: ${isWon}`);

                if (isWon) {
                    console.log('%c 🚀 Triggering Financial Sync (New Deal)...', 'color: #10b981;');
                    financeService.syncSaleFromDeal({
                        id: newDeal.id,
                        title: formData.company,
                        empresa_cliente: formData.company,
                        faturamento_mensal: parseFloat(formData.value || 0)
                    })
                        .then(() => alert('✅ Venda registrada no financeiro com sucesso!'))
                        .catch(e => {
                            console.error('Financial sync failed:', e);
                            alert('⚠️ Erro na sincronização financeira: ' + e.message);
                        });
                }


                await logActivity({

                    actionType: 'CREATE',
                    entityType: 'DEAL',
                    entityId: newDeal.id,
                    details: { name: newDeal.empresa_cliente, value: newDeal.faturamento_mensal },
                    userId: user?.id
                });
            }

            // Reset form
            setFormData({
                company: '',
                contact_name: '',
                value: '597',
                column_id: columns[0]?.id || '',
                instagram: '',
                whatsapp: ''
            });
            onClose();

        } catch (error) {
            console.error('Error creating deal:', error);
            alert('Erro ao criar negócio: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(8px);
                }

                .modal-content {
                    background: linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.98) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    padding: 2.5rem;
                    position: relative;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                }

                .close-btn {
                    position: absolute;
                    top: 1.25rem; right: 1.25rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .modal-header { margin-bottom: 2rem; }
                .modal-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .form-group { margin-bottom: 1.5rem; }
                .form-label {
                    display: block;
                    margin-bottom: 0.625rem;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: var(--text-primary);
                    font-size: 1rem;
                }

                .modal-footer {
                    margin-top: 2rem;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .btn-cancel {
                    padding: 0.875rem 1.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .btn-submit {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #bef264 0%, #a3e635 100%);
                    color: #1a1a1a;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    display: flex; align-items: center; gap: 0.625rem;
                    cursor: pointer;
                }
            `}</style>

            <div className="modal-content">
                <button className="close-btn" onClick={onClose}><X size={20} /></button>

                <div className="modal-header">
                    <h2>Novo Negócio</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">NOME DA EMPRESA</label>
                        <input className="form-input" name="company" placeholder="Ex: Empresa X" value={formData.company} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">NOME DO CONTATO</label>
                        <input className="form-input" name="contact_name" placeholder="Ex: João Silva" value={formData.contact_name} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label className="form-label">FATURAMENTO MENSAL (R$)</label>
                        <input className="form-input" type="number" name="value" value={formData.value} onChange={handleChange} required step="0.01" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">ETAPA INICIAL</label>
                        <select className="form-input" name="column_id" value={formData.column_id} onChange={handleChange}>
                            {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">INSTAGRAM</label>
                            <input className="form-input" name="instagram" placeholder="@usuario" value={formData.instagram} onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">WHATSAPP</label>
                            <input className="form-input" name="whatsapp" placeholder="(11) 99999-9999" value={formData.whatsapp} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            <Save size={18} /> {loading ? 'Carregando...' : 'Salvar Negócio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewDealModal;
