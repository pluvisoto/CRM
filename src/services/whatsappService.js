/**
 * WhatsApp Service
 * 
 * Handles message generation and API integration for customer communication.
 * Currently configured for:
 * 1. Manual Link Generation (Immediate)
 * 2. W-API Integration (Stub/Ready for Keys)
 */

// TODO: Replace with actual keys when provided by user
const W_API_KEY = import.meta.env.VITE_W_API_KEY || 'PLACEHOLDER_KEY';
const W_API_ENDPOINT = 'https://api.wapi.com.br/v1/send';

const whatsappService = {
    /**
     * Standard Onboarding Message Template
     */
    getOnboardingMessage(clientName) {
        return `Olá ${clientName}! 🎉 Parabéns pela parceria! 

Estamos muito felizes em ter você conosco. Para darmos início à confecção do seu contrato, por favor, nos envie os seguintes documentos:

1. Cartão CNPJ da Empresa
2. CNH ou RG de quem assina pela empresa
3. E-mail para envio do contrato para assinatura

Assim que recebermos, nosso sistema irá gerar o contrato para sua assinatura digital.`;
    },

    /**
     * Build a WhatsApp message URL for the client (Manual Fallback).
     * @param {string} phone - Client phone number
     * @param {Object} deal - Deal data for template variables
     */
    generateOnboardingLink(phone, deal) {
        if (!phone) return null;

        const clientName = deal.nome_contato || deal.empresa_cliente || 'Parceiro';
        const message = this.getOnboardingMessage(clientName);

        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = phone.replace(/\D/g, ''); // Remove non-digits

        return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`; // Assuming BR +55 if missing
    },

    /**
     * Trigger automated message via W-API.
     * @param {string} phone - Client phone number
     * @param {Object} deal - Deal data
     */
    async sendAutomatedOnboarding(phone, deal) {
        const clientName = deal.nome_contato || deal.empresa_cliente || 'Parceiro';
        const cleanPhone = phone.replace(/\D/g, '');
        const message = this.getOnboardingMessage(clientName);

        console.log(`[W-API] Attempting to send to ${cleanPhone}...`);

        if (W_API_KEY === 'PLACEHOLDER_KEY') {
            console.warn('[W-API] Key missing. Returning mock success.');
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true, method: 'mock', message: 'API Key missing - Simulação' };
        }

        try {
            const response = await fetch(W_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${W_API_KEY}`
                },
                body: JSON.stringify({
                    phone: `55${cleanPhone}`,
                    message: message
                })
            });

            if (!response.ok) {
                throw new Error(`W-API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, method: 'api', data };

        } catch (error) {
            console.error('[W-API] Failed:', error);
            return { success: false, error: error.message };
        }
    }
};

export default whatsappService;
