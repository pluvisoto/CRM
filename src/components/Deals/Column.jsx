import React, { useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Trash2, Pencil, ArrowLeftRight } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import DealCard from './DealCard';

const Column = ({ column, deals, onDealClick, onDeleteColumn, onUpdateTitle, onUpdateColor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const COLUMN_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#6b7280', // Gray
    '#bef264'  // Lime
  ];

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== column.title) {
      onUpdateTitle(editTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditTitle(column.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setSortableRef}
      className="flex flex-col transition-all duration-300"
      style={{
        ...style,
        minWidth: '360px',
        width: '360px',
        flexShrink: 0,
        height: '100%', // Fills board strictly
        maxHeight: '100%', // FORCE BOUNDS
        gap: '12px',
        padding: '16px',
        background: `linear-gradient(180deg, color-mix(in srgb, ${column.color}, transparent 95%) 0%, rgba(20, 20, 25, 0.45) 100%)`,
        border: `1px solid color-mix(in srgb, ${column.color}, transparent 85%)`,
        boxShadow: `0 8px 32px -5px rgba(0,0,0,0.5)`,
        backdropFilter: 'blur(10px)',
        borderRadius: '32px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
    >
      {/* HEADER CARD - 120px height as requested (60% reduction from 280px) */}
      <div
        className={`flex flex-col cursor-grab active:cursor-grabbing hover:bg-white/5 transition-all group relative border ${isEditing ? 'p-6' : 'p-8'}`}
        style={{
          background: isEditing
            ? 'rgba(15, 15, 20, 0.98)'
            : `linear-gradient(135deg, color-mix(in srgb, ${column.color}, transparent 25%) 0%, rgba(30,30,40,0.8) 100%)`,
          borderColor: isEditing
            ? 'rgba(255, 255, 255, 0.2)'
            : `color-mix(in srgb, ${column.color}, transparent 44%)`,
          borderRadius: '24px',
          boxShadow: `0 10px 20px -10px ${column.color}33`,
          transition: 'all 0.3s ease',
          flexShrink: 0,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '120px', // Exact height requested
          height: '120px'
        }}
        {...attributes}
        {...(!isEditing ? listeners : {})}
      >
        {/* Color Strip on the left */}
        <div style={{ position: 'absolute', left: 0, top: '16px', bottom: '16px', width: '4px', backgroundColor: column.color, borderRadius: '0 4px 4px 0', opacity: 0.8 }} />

        {/* Header Content - Aligned 32px to match DealCard */}
        <div className="flex flex-col gap-1" style={{ paddingLeft: '32px', paddingRight: '20px' }}>
          {isEditing ? (
            <div
              className="flex flex-col gap-3 w-full"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-[16px] font-black text-white outline-none w-full uppercase"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex gap-2 flex-wrap justify-between items-center">
                <div className="flex gap-2">
                  {COLUMN_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateColor(c);
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: c,
                        boxShadow: column.color === c ? `0 0 10px ${c}` : 'none',
                        border: column.color === c ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                        transition: 'transform 0.2s',
                      }}
                      className="hover:scale-125 active:scale-95"
                    />
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase"
                >
                  OK
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <h3
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="font-black text-[16px] uppercase tracking-tight text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {column.title}
                </h3>
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse"
                  style={{ backgroundColor: column.color, boxShadow: `0 0 15px ${column.color}` }}
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80 whitespace-nowrap" style={{ marginRight: '12px' }}>
                    Negócios:
                  </span>
                  <span className="text-[16px] font-black px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-max font-inter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
                      deals.reduce((acc, deal) => acc + (Number(deal.value) || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DEALS LIST AREA - ROBUST INTERNAL SCROLLING */}
      <div
        ref={setDroppableRef}
        className="custom-scrollbar"
        style={{
          flex: '1 1 auto', // Take remaining space
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '4px',
          paddingBottom: '200px', // MASSIVE bottom padding so Test 6 isn't the bottom-most thing
          marginTop: '8px',
          height: '100%', // Allow it to fill the flex container
          minHeight: '0' // Flex shrink requirement
        }}
      >
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onClick={() => onDealClick(deal)}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;
