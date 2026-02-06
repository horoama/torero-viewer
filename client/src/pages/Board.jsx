/* client/src/pages/Board.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TrelloList from '../components/TrelloList';
import CardModal from '../components/CardModal';

const Board = () => {
  const { filename } = useParams();
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/files/${filename}`);
        setBoardData(response.data);
      } catch (err) {
        setError('Failed to load board data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [filename]);

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  if (!boardData) return null;

  // Process Data
  const lists = boardData.lists.filter(l => !l.closed).sort((a, b) => a.pos - b.pos);
  const cards = boardData.cards.filter(c => !c.closed);

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
      <div className="h-12 bg-black bg-opacity-30 flex items-center px-4 justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-4">
            <Link to="/" className="text-white font-bold hover:bg-white hover:bg-opacity-20 px-3 py-1 rounded">
                Home
            </Link>
            <h1 className="text-white font-bold text-lg">{boardData.name}</h1>
        </div>
      </div>

      {/* Board Canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex h-full items-start">
          {lists.map(list => (
            <TrelloList
              key={list.id}
              list={list}
              cards={cards.filter(c => c.idList === list.id).sort((a, b) => a.pos - b.pos)}
              labels={labelsMap}
              members={membersMap}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={closeCardModal}
          listName={lists.find(l => l.id === selectedCard.idList)?.name}
          labelsMap={labelsMap}
          membersMap={membersMap}
          checklistsMap={checklistsMap}
        />
      )}
    </div>
  );
};

export default Board;
