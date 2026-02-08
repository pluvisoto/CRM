import React, { useState, useEffect } from 'react';
import { FileText, Save, Download, Send, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import contractService from '../../../services/contractService';
import pdfGenerator from '../../../services/pdfGenerator';

const ContractTab = ({ deal }) => {
    const [loading, setLoading] = useState(false);
    const [contractData, setContractData] = useState({
        razao_social: '',
        cnpj: '',
        endereco_cep: '',
        endereco_rua: '',
        endereco_numero: '',
        endereco_bairro: '',
        endereco_cidade: '',
        endereco_estado: '',
        nome_representante: '',
        cpf_representante: '',
        email_assinatura: '',
        testemunha1_nome: '',
        testemunha1_cpf: '',
        testemunha2_nome: '',
        testemunha2_cpf: ''
    });

    useEffect(() => {
        if (deal) {
            setContractData(prev => ({
                ...prev,
                razao_social: deal.empresa_cliente || '',
                cnpj: deal.cnpj || '',
                // Leave address fields empty or try to parse if needed. 
                // For strict validation, forcing manual entry might be better if deal.endereco is unstructured.
                // If deal.endereco exists, put it in 'rua' for now just to not lose it, but user must fix.
                endereco_rua: deal.endereco || '',
                nome_representante: deal.nome_contato || '',
                cpf_representante: deal.cpf || '',
                email_assinatura: deal.email_contato || deal.email || ''
            }));
        }
    }, [deal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContractData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            console.log('Saving contract data:', contractData);
            await new Promise(resolve => setTimeout(resolve, 800));
            alert('Dados do contrato salvos (Simulação)');
        } catch (error) {
            console.error('Error saving contract data:', error);
            alert('Erro ao salvar dados.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateDraft = async () => {
        // Strict Validation
        if (!contractData.endereco_cidade || !contractData.endereco_estado || !contractData.endereco_cep) {
            alert('Por favor, preencha o endereço completo (CEP, Cidade e Estado são obrigatórios).');
            return;
        }

        setLoading(true);
        try {
            // Construct full address for the template
            const enderecoCompleto = `${contractData.endereco_rua}, ${contractData.endereco_numero || 'S/N'} - ${contractData.endereco_bairro || ''}, ${contractData.endereco_cidade} - ${contractData.endereco_estado}, CEP ${contractData.endereco_cep}`;

            const finalData = {
                ...contractData,
                endereco_completo: enderecoCompleto
            };

            const result = pdfGenerator.generateContractPDF(deal, finalData);
            if (result.success) {
                alert(result.message);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao gerar contrato.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendToSign = async () => {
        console.log('[DEBUG] handleSendToSign started');
        // Strict Validation matches generation
        if (!contractData.endereco_cidade || !contractData.endereco_estado || !contractData.endereco_cep) {
            console.warn('[DEBUG] Validation failed: Address incomplete');
            alert('Por favor, preencha o endereço completo antes de enviar.');
            return;
        }

        if (!contractData.cpf_representante || !contractData.email_assinatura) {
            console.warn('[DEBUG] Validation failed: Representative data incomplete');
            alert('CPF e Email do representante são obrigatórios para assinatura digital.');
            return;
        }

        setLoading(true);
        try {
            console.log('[DEBUG] Validation passed. Generating PDF Blob...');
            // 1. Generate the PDF Blob locally
            const enderecoCompleto = `${contractData.endereco_rua}, ${contractData.endereco_numero || 'S/N'} - ${contractData.endereco_bairro || ''}, ${contractData.endereco_cidade} - ${contractData.endereco_estado}, CEP ${contractData.endereco_cep}`;

            console.log('[DEBUG] Generating Contract (PDF) using pdfGenerator...');

            // Generates PDF blob directly
            const blob = await pdfGenerator.getContractBlob(deal, { ...contractData, endereco_completo: enderecoCompleto });
            console.log('[DEBUG] PDF Blob generated:', blob);

            // 2. Prepare Signers
            const signers = [
                {
                    name: contractData.nome_representante || 'Cliente',
                    email: contractData.email_assinatura,
                    cpf: contractData.cpf_representante
                },
                {
                    name: 'Paulo Cesar Luvisoto Filho',
                    email: 'paulo@recupera.ia.br',
                    cpf: '26467807880'
                },
                // Witnesses (Testemunhas)
                {
                    name: 'Luis Guilherme Lima Kempe',
                    email: 'kempe@recupera.ia.br',
                    cpf: '45786680886',
                    type: 'WITNESS'
                },
                {
                    name: 'Matheus Guimarães L. C. Gonçalves',
                    email: 'matheus@recupera.ia.br',
                    cpf: '45936554805',
                    type: 'WITNESS'
                }
            ];



            // Add CC (Recupera) logic passed to service separately or as a specific type
            // Passing as specific signer type for now to ensure delivery, or handling in service if 'copy' supported
            const ccReceivers = [
                { name: 'Recupera', email: 'recupera@recupera.ia.br' }
            ];

            console.log('[DEBUG] Signers prepared:', signers);
            console.log('[DEBUG] CC prepared:', ccReceivers);

            const fileName = `Contrato - ${contractData.razao_social || 'Cliente'}.pdf`;

            // 3. Send to Assinafy
            console.log('[DEBUG] Importing assinafyService...');
            const { assinafyService } = await import('../../../services/assinafyService');

            if (!assinafyService) {
                throw new Error('assinafyService não foi importado corretamente');
            }

            console.log('[DEBUG] calling assinafyService.createDocument...');
            const result = await assinafyService.createDocument(blob, fileName, signers, ccReceivers);
            console.log('[DEBUG] Result:', result);

            if (result.success) {
                alert(`Sucesso! Documento enviado. ID: ${result.data?.id || 'N/A'}`);
            } else {
                alert(`Erro na API: ${result.message}`);
            }

        } catch (error) {
            console.error('[DEBUG] Catch Error:', error);
            alert(`Erro ao enviar: ${error.message}`);
        } finally {
            console.log('[DEBUG] Finally block - setLoading(false)');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="text-brand" size={20} />
                    Dados do Contrato
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-sm rounded-lg transition-colors border border-white/10"
                    >
                        <Save size={16} />
                        Salvar
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {/* warning for missing template */}
                {/* Removed warning as file is now present */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-text-secondary uppercase">Razão Social</label>
                        <input
                            type="text"
                            name="razao_social"
                            value={contractData.razao_social}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                            placeholder="Nome Oficial da Empresa"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-text-secondary uppercase">CNPJ</label>
                        <input
                            type="text"
                            name="cnpj"
                            value={contractData.cnpj}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                            placeholder="00.000.000/0000-00"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 grid grid-cols-12 gap-2">
                        <div className="col-span-12 md:col-span-3 space-y-1">
                            <label className="text-xs font-medium text-text-secondary uppercase">CEP <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="endereco_cep"
                                value={contractData.endereco_cep || ''}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                                placeholder="00000-000"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-7 space-y-1">
                            <label className="text-xs font-medium text-text-secondary uppercase">Rua <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="endereco_rua"
                                value={contractData.endereco_rua || ''}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                                placeholder="Nome da Rua"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-text-secondary uppercase">Número <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="endereco_numero"
                                value={contractData.endereco_numero || ''}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                                placeholder="123"
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4 space-y-1">
                            <label className="text-xs font-medium text-text-secondary uppercase">Bairro <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="endereco_bairro"
                                value={contractData.endereco_bairro || ''}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                                placeholder="Bairro"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6 space-y-1">
                            <label className="text-xs font-medium text-text-secondary uppercase">Cidade <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="endereco_cidade"
                                value={contractData.endereco_cidade || ''}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                                placeholder="Cidade"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-2 space-y-1">
                            <label className="text-xs font-medium text-text-secondary uppercase">UF <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="endereco_estado"
                                value={contractData.endereco_estado || ''}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                                placeholder="SP"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-text-secondary uppercase">Representante Legal</label>
                        <input
                            type="text"
                            name="nome_representante"
                            value={contractData.nome_representante}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                            placeholder="Nome Completo"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-text-secondary uppercase">CPF do Representante</label>
                        <input
                            type="text"
                            name="cpf_representante"
                            value={contractData.cpf_representante}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                            placeholder="000.000.000-00"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-text-secondary uppercase">Email para Assinatura</label>
                        <input
                            type="email"
                            name="email_assinatura"
                            value={contractData.email_assinatura}
                            onChange={handleChange}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-brand outline-none"
                            placeholder="email@empresa.com.br"
                        />
                    </div>


                </div>

                <div className="pt-6 border-t border-white/10 flex gap-4">
                    <button
                        onClick={handleGenerateDraft}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all"
                    >
                        <Download size={18} />
                        Gerar Contrato (PDF)
                    </button>

                    <button
                        onClick={handleSendToSign}
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Send size={18} />
                        Enviar para Assinatura
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContractTab;
