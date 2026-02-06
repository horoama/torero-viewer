/* client/src/components/TrelloCard.jsx */
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const TrelloCard = ({ card, onClick, labels, members, index }) => {
  const cardLabels = card.idLabels.map(id => labels[id]).filter(Boolean);
  const cardMembers = card.idMembers.map(id => members[id]).filter(Boolean);

  // Check if card has any bottom metadata to display
  const hasMetadata = card.desc || card.due || (card.attachments && card.attachments.length > 0) || card.checkItems > 0 || cardMembers.length > 0;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg p-2 mb-2 cursor-pointer group relative text-trello-text shadow-trello-card ring-0 hover:ring-2 hover:ring-[#388bff] transition-shadow ${snapshot.isDragging ? 'shadow-2xl rotate-2 z-50 ring-2 ring-[#388bff]' : ''}`}
          onClick={(e) => {
              if (!e.defaultPrevented) {
                  onClick(card);
              }
          }}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Labels */}
          {cardLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {cardLabels.map(label => (
                <span
                  key={label.id}
                  className={`text-[11px] px-2 py-0.5 rounded text-white font-bold leading-3 min-w-[40px] truncate`}
                  style={{ backgroundColor: getLabelColor(label.color) }}
                  title={label.name}
                >
                  {label.name || '\u00A0'}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-[#172b4d] text-sm font-normal mb-1 leading-5 break-words">{card.name}</h3>

          {/* Badges / Members */}
          {hasMetadata && (
          <div className="flex justify-between items-end mt-1.5">
            <div className="flex flex-wrap gap-2 text-[#44546f] text-xs items-center">
               {card.desc && <span title="Description">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg>
               </span>}
               {card.due && (
                 <span
                    className={`flex items-center rounded-sm px-1 py-0.5 gap-1 ${card.dueComplete ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-transparent hover:bg-[#091e4214]'}`}
                    title={`Due: ${new Date(card.due).toLocaleDateString()}`}
                 >
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/></svg>
                   {/* Format date briefly */}
                   {new Date(card.due).getDate()}
                 </span>
               )}
               {card.attachments && card.attachments.length > 0 && (
                 <span className="flex items-center gap-0.5" title="Attachments">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="rotate-45"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
                    {card.attachments.length}
                 </span>
               )}
               {card.checkItems > 0 && (
                 <span className={`flex items-center gap-0.5 rounded-sm px-1 ${card.checkItemsChecked === card.checkItems ? 'bg-green-500 text-white' : ''}`} title="Checklist">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                   {card.checkItemsChecked}/{card.checkItems}
                 </span>
               )}
            </div>

            <div className="flex -space-x-1 ml-auto">
              {cardMembers.map(member => (
                <div key={member.id} className="w-6 h-6 rounded-full border border-white relative" title={member.fullName}>
                     {member.avatarUrl ? (
                         <img src={`${member.avatarUrl}/30.png`} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
                     ) : (
                         <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-700">
                             {member.initials || 'M'}
                         </div>
                     )}
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// Helper for label colors (simplified mapping)
// Trello standard colors
const getLabelColor = (colorName) => {
  const colors = {
    green: '#4bce97',
    yellow: '#f5cd47', // Trello uses lighter yellow now, but standard is fine
    orange: '#fea362',
    red: '#f87168',
    purple: '#9f8fef',
    blue: '#579dff',
    sky: '#6cc3e0',
    lime: '#94c748',
    pink: '#e774bb',
    black: '#8590a2',
    // ...
  };
  return colors[colorName] || '#b3bac5';
};

export default TrelloCard;
