/* client/src/components/TrelloCard.jsx */
import React from 'react';

const TrelloCard = ({ card, onClick, labels, members }) => {
  const cardLabels = card.idLabels.map(id => labels[id]).filter(Boolean);
  const cardMembers = card.idMembers.map(id => members[id]).filter(Boolean);

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-3 mb-2 cursor-pointer hover:bg-gray-50 border border-gray-200"
      onClick={() => onClick(card)}
    >
      {/* Labels */}
      {cardLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {cardLabels.map(label => (
            <span
              key={label.id}
              className={`text-xs px-2 py-0.5 rounded text-white font-semibold`}
              style={{ backgroundColor: getLabelColor(label.color) }}
            >
              {label.name || '\u00A0'}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-gray-800 text-sm font-medium mb-2">{card.name}</h3>

      {/* Badges / Members */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 text-gray-500 text-xs">
           {card.desc && <span title="This card has a description">≡</span>}
           {card.due && (
             <span
                className={`flex items-center rounded px-1 ${card.dueComplete ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                title={`Due: ${new Date(card.due).toLocaleDateString()}`}
             >
               Clock
             </span>
           )}
           {card.attachments && card.attachments.length > 0 && <span>📎 {card.attachments.length}</span>}
           {card.checkItems > 0 && (
             <span className={`${card.checkItemsChecked === card.checkItems ? 'bg-green-500 text-white px-1 rounded' : ''}`}>
               ☑ {card.checkItemsChecked}/{card.checkItems}
             </span>
           )}
        </div>

        <div className="flex -space-x-1">
          {cardMembers.map(member => (
            <img
              key={member.id}
              src={member.avatarUrl ? `${member.avatarUrl}/30.png` : 'https://placehold.co/30x30?text=' + (member.initials || 'M')}
              alt={member.fullName}
              title={member.fullName}
              className="w-6 h-6 rounded-full border border-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper for label colors (simplified mapping)
const getLabelColor = (colorName) => {
  const colors = {
    green: '#61bd4f',
    yellow: '#f2d600',
    orange: '#ff9f1a',
    red: '#eb5a46',
    purple: '#c377e0',
    blue: '#0079bf',
    sky: '#00c2e0',
    lime: '#51e898',
    pink: '#ff78cb',
    black: '#344563',
    // ... add more as needed
  };
  return colors[colorName] || '#b3bac5';
};

export default TrelloCard;
