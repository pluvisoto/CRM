import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Instagram, MessageCircle } from 'lucide-react';

// Presentational Component - Safe for DragOverlay (No hooks)
export const DealCardContent = forwardRef(({ deal, isDragging, style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={style}
      className={`deal-card ${isDragging ? 'is-dragging' : ''}`}
      {...props}
    >
      {!isDragging && (
        <>
          <div className="card-header">
            <span className="deal-title">{deal.title}</span>
          </div>

          <div className="deal-value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
          </div>

          <div className="deal-meta">
            <div className="company-info">{deal.company}</div>
            {deal.contact_name && <div className="contact-info">👤 {deal.contact_name}</div>}
          </div>

          <div className="deal-tags">
            {deal.tags && deal.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>

          {(deal.instagram || deal.whatsapp) && (
            <div className="deal-socials">
              {deal.instagram && (
                <a href={deal.instagram.includes('http') ? deal.instagram : `https://instagram.com/${deal.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link instagram"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram size={14} />
                </a>
              )}
              {deal.whatsapp && (
                <a href={`https://wa.me/${deal.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link whatsapp"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle size={14} />
                </a>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        .deal-card {
          background: linear-gradient(135deg, rgba(30,30,40,0.6) 0%, rgba(20,20,30,0.8) 100%);
          padding: 1.25rem 20px 1.25rem 32px;
          border-radius: 20px; /* Increased rounding */
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          backdrop-filter: blur(10px);
          overflow: hidden; /* Ensure contents follow rounded corners */
          cursor: grab;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          color: var(--text-primary);
          min-height: 100px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .deal-card:hover {
          transform: translateY(-2px);
          border-color: rgba(190, 242, 100, 0.3);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          background: linear-gradient(135deg, rgba(30,30,40,0.7) 0%, rgba(20,20,30,0.9) 100%);
        }

        .deal-card.is-dragging {
          opacity: 0.5;
          border: 2px dashed rgba(190, 242, 100, 0.5);
          background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          height: 120px;
          cursor: grabbing;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .deal-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .deal-value {
          font-size: 1.25rem;
          color: #bef264;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .company-info {
          font-size: 0.8rem;
          color: var(--text-secondary);
          opacity: 0.8;
        }

        .deal-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          font-size: 0.7rem;
          padding: 3px 10px;
          border-radius: 100px; /* Fully rounded tags */
          background: rgba(255,255,255,0.05);
          color: var(--text-secondary);
          border: 1px solid rgba(255,255,255,0.1);
          font-weight: 600;
        }

        .deal-socials {
            display: flex;
            gap: 8px;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 50%; /* Circular social icons */
            color: var(--text-secondary);
            background: rgba(255,255,255,0.05);
            transition: all 0.2s;
            border: 1px solid rgba(255,255,255,0.1);
        }
        
        .social-link:hover {
            color: white;
            background: rgba(255,255,255,0.1);
            transform: scale(1.1);
        .contact-info {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
});

// Container Component with Drag Logic
const DealCard = ({ deal, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { type: 'Deal', deal } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <DealCardContent
      ref={setNodeRef}
      style={style}
      deal={deal}
      isDragging={isDragging}
      onClick={onClick}
      {...attributes}
      {...listeners}
    />
  );
};

export default DealCard;
