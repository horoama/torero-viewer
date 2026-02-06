/* client/src/components/TrelloList.jsx */
import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import TrelloCard from './TrelloCard';

const TrelloList = ({ list, cards, labels, members, onCardClick, index }) => {
  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          className="w-trello-list flex-shrink-0 bg-trello-list rounded-xl pb-2 px-2 pt-2 max-h-full flex flex-col shadow-sm"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {/* Header - Handle for dragging the list */}
          <div
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing flex justify-between items-start px-2 py-2 mb-1"
          >
            <h2 className="text-sm font-semibold text-trello-text break-words leading-tight">{list.name}</h2>
            <div className="p-1 hover:bg-black/5 rounded cursor-pointer text-gray-500 transition-colors">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </div>
          </div>

          <Droppable droppableId={list.id} type="card">
            {(provided, snapshot) => (
              <div
                className={`overflow-y-auto flex-1 px-1 custom-scrollbar min-h-[2px] ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {cards.map((card, index) => (
                  <TrelloCard
                    key={card.id}
                    card={card}
                    index={index}
                    labels={labels}
                    members={members}
                    onClick={onCardClick}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

        </div>
      )}
    </Draggable>
  );
};

export default TrelloList;
