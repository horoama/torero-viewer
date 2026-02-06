/* client/src/components/TrelloList.jsx */
import React from 'react';
import TrelloCard from './TrelloCard';

const TrelloList = ({ list, cards, labels, members, onCardClick }) => {
  return (
    <div className="w-72 flex-shrink-0 bg-gray-100 rounded-lg p-2 mr-4 max-h-full flex flex-col">
      <h2 className="text-sm font-bold text-gray-700 px-2 py-2">{list.name}</h2>
      <div className="overflow-y-auto flex-1 px-1 custom-scrollbar">
        {cards.map(card => (
          <TrelloCard
            key={card.id}
            card={card}
            labels={labels}
            members={members}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TrelloList;
