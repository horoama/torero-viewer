/* client/src/pages/Board.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TrelloList from '../components/TrelloList';
import CardModal from '../components/CardModal';

const Board = () => {
  const { filename } = useParams();
  const [boardData, setBoardData] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await axios.get(`/api/files/${filename}`);
        setBoardData(response.data);

        // Initial sort by pos
        const initialLists = response.data.lists
            .filter(l => !l.closed)
            .sort((a, b) => a.pos - b.pos);

        const initialCards = response.data.cards
            .filter(c => !c.closed)
            .sort((a, b) => a.pos - b.pos);

        setLists(initialLists);
        setCards(initialCards);
      } catch (err) {
        setError('Failed to load board data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [filename]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Move List
    if (type === 'list') {
        const newLists = Array.from(lists);
        const [reorderedList] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, reorderedList);
        setLists(newLists);
        return;
    }

    // Move Card
    if (type === 'card') {
        // Separate cards into groups: source list, destination list, and others
        const sourceListId = source.droppableId;
        const destListId = destination.droppableId;

        // Important: We must preserve the order of cards as they are currently in state
        // The state 'cards' contains all cards. We need to filter them in the same order they are rendered.
        // Render order is determined by filtering state.cards by listId.
        // Since we don't re-sort state.cards every render (we just filter), we rely on their order in the array.
        // However, standard filter doesn't guarantee we get them in the "visual" order if the array is mixed.
        // BUT: In our logic below, we reconstruct the array list-by-list, so it effectively groups them.

        let sourceCards = cards.filter(c => c.idList === sourceListId);
        let destCards = (sourceListId === destListId)
                        ? sourceCards
                        : cards.filter(c => c.idList === destListId);
        const otherCards = cards.filter(c => c.idList !== sourceListId && c.idList !== destListId);

        // Find the moved card
        const movedCard = sourceCards[source.index]; // Trusting the index matches the filtered array

        // Remove from source
        sourceCards.splice(source.index, 1);

        // Update card's list ID
        if (sourceListId !== destListId) {
            movedCard.idList = destListId;
            // Insert into dest
            destCards.splice(destination.index, 0, movedCard);
        } else {
            // Insert back into same list
            sourceCards.splice(destination.index, 0, movedCard);
        }

        // Reconstruct the full cards array
        // We put otherCards first, then source, then dest (arbitrary order for storage, but keeps lists grouped)
        if (sourceListId === destListId) {
             setCards([...otherCards, ...sourceCards]);
        } else {
             setCards([...otherCards, ...sourceCards, ...destCards]);
        }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  if (!boardData) return null;

  // Create Lookup Maps
  const labelsMap = boardData.labels ? boardData.labels.reduce((acc, label) => ({ ...acc, [label.id]: label }), {}) : {};
  const membersMap = boardData.members ? boardData.members.reduce((acc, member) => ({ ...acc, [member.id]: member }), {}) : {};
  const checklistsMap = boardData.checklists ? boardData.checklists.reduce((acc, checklist) => ({ ...acc, [checklist.id]: checklist }), {}) : {};

  // Background Style
  const bgStyle = {};
  if (boardData.prefs) {
     if (boardData.prefs.backgroundImage) {
         bgStyle.backgroundImage = `url(${boardData.prefs.backgroundImage})`;
         bgStyle.backgroundSize = 'cover';
         bgStyle.backgroundPosition = 'center';
     } else if (boardData.prefs.backgroundColor) {
         bgStyle.backgroundColor = boardData.prefs.backgroundColor;
     } else {
         bgStyle.backgroundColor = '#0079bf'; // Default Trello Blue
     }
  }

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const closeCardModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="h-screen flex flex-col" style={bgStyle}>
      {/* Header */}
      <div className="h-[48px] bg-black/20 flex items-center px-4 justify-between backdrop-blur-[4px] flex-shrink-0 z-10 shadow-sm border-b border-white/10">
        <div className="flex items-center gap-4">
            <Link to="/" className="text-white/90 hover:bg-white/20 hover:text-white px-3 py-1.5 rounded font-bold text-sm transition-colors flex items-center gap-2">
                 Boards
            </Link>
            <h1 className="text-white font-bold text-lg px-2 drop-shadow-md">{boardData.name}</h1>
        </div>
        <div className="flex items-center gap-2">
            {/* Simple User Avatar Placeholder */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center text-xs font-bold cursor-pointer shadow-sm border border-white/20">
                You
            </div>
        </div>
      </div>

      {/* Board Canvas */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
                <div
                    className="flex-1 overflow-x-auto overflow-y-hidden board-scroll select-none"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                >
                    <div className="flex h-full items-start p-3 space-x-3">
                    {lists.map((list, index) => (
                        <TrelloList
                            key={list.id}
                            list={list}
                            index={index}
                            cards={cards.filter(c => c.idList === list.id)}
                            labels={labelsMap}
                            members={membersMap}
                            onCardClick={handleCardClick}
                        />
                    ))}
                    {provided.placeholder}
                    </div>
                </div>
            )}
        </Droppable>
      </DragDropContext>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={closeCardModal}
          listName={lists.find(l => l.id === selectedCard.idList)?.name}
          labelsMap={labelsMap}
          membersMap={membersMap}
          checklistsMap={checklistsMap}
          actions={boardData.actions || []}
        />
      )}
    </div>
  );
};

export default Board;
