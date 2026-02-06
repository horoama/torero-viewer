/* client/src/components/CardModal.jsx */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

const CardModal = ({ card, onClose, listName, labelsMap, membersMap, checklistsMap }) => {
  const cardLabels = card.idLabels.map(id => labelsMap[id]).filter(Boolean);
  const cardMembers = card.idMembers.map(id => membersMap[id]).filter(Boolean);
  const cardChecklists = card.idChecklists.map(id => checklistsMap[id]).filter(Boolean);

  // Close when clicking outside content
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-60 overflow-y-auto pt-10 pb-10" onClick={handleOverlayClick}>
      <div className="bg-gray-100 rounded-lg shadow-xl w-full max-w-3xl relative p-6 m-4 min-h-[50vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        {/* Title Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📇</span>
            {card.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1 ml-8">in list <span className="underline">{listName}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
             {/* Labels & Members & Due Date Row */}
             <div className="flex flex-wrap gap-4 ml-8">
                {cardMembers.length > 0 && (
                    <div>
                        <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Members</h3>
                        <div className="flex space-x-1">
                            {cardMembers.map(member => (
                                <img
                                    key={member.id}
                                    src={member.avatarUrl ? `${member.avatarUrl}/30.png` : 'https://placehold.co/30x30?text=' + (member.initials || 'M')}
                                    alt={member.fullName}
                                    title={member.fullName}
                                    className="w-8 h-8 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {cardLabels.length > 0 && (
                    <div>
                        <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Labels</h3>
                        <div className="flex flex-wrap gap-1">
                            {cardLabels.map(label => (
                                <span
                                    key={label.id}
                                    className="px-2 py-1 rounded text-white font-semibold text-sm"
                                    style={{ backgroundColor: getLabelColor(label.color) }}
                                >
                                    {label.name || label.color}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {card.due && (
                    <div>
                         <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Due Date</h3>
                         <div className="flex items-center">
                             <input type="checkbox" checked={card.dueComplete} readOnly className="mr-2" />
                             <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                                {format(new Date(card.due), 'PPP p')}
                                {card.dueComplete && <span className="ml-2 text-xs bg-green-500 text-white px-1 rounded">COMPLETED</span>}
                             </span>
                         </div>
                    </div>
                )}
             </div>

            {/* Description */}
            <div className="ml-8">
               <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                   <span className="mr-2 -ml-8">≡</span> Description
               </h3>
               {card.desc ? (
                   <div className="prose prose-sm max-w-none text-gray-800 bg-white p-3 rounded-md shadow-sm border border-gray-200">
                       <ReactMarkdown>{card.desc}</ReactMarkdown>
                   </div>
               ) : (
                   <p className="text-gray-500 italic">No description provided.</p>
               )}
            </div>

             {/* Attachments */}
            {card.attachments && card.attachments.length > 0 && (
                <div className="ml-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                        <span className="mr-2 -ml-8">📎</span> Attachments
                    </h3>
                    <div className="space-y-2">
                        {card.attachments.map(att => (
                            <div key={att.id} className="flex items-center bg-white p-2 rounded border border-gray-200 hover:bg-gray-50">
                                {att.previews && att.previews.length > 0 ? (
                                    <img src={att.previews[0].url} alt="" className="w-20 h-20 object-cover rounded mr-3 bg-gray-200" />
                                ) : (
                                    <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded mr-3 text-gray-400 font-bold">
                                        {att.url.split('.').pop().toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 overflow-hidden">
                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-800 hover:underline block truncate">
                                        {att.name}
                                    </a>
                                    <span className="text-xs text-gray-500">{format(new Date(att.date), 'PPP')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Checklists */}
            {cardChecklists.length > 0 && (
                <div className="ml-8 space-y-6">
                    {cardChecklists.map(checklist => (
                         <div key={checklist.id}>
                             <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-between">
                                 <div className="flex items-center">
                                    <span className="mr-2 -ml-8">☑</span> {checklist.name}
                                 </div>
                             </h3>
                             {/* Progress Bar */}
                             {(() => {
                                 const total = checklist.checkItems.length;
                                 const completed = checklist.checkItems.filter(i => i.state === 'complete').length;
                                 const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
                                 return (
                                     <div className="mb-2">
                                         <div className="flex items-center mb-1">
                                             <span className="text-xs text-gray-500 w-8">{percent}%</span>
                                             <div className="flex-1 bg-gray-300 rounded-full h-2">
                                                 <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })()}

                             <div className="space-y-1">
                                 {checklist.checkItems.sort((a,b) => a.pos - b.pos).map(item => (
                                     <div key={item.id} className="flex items-start group">
                                         <input
                                            type="checkbox"
                                            checked={item.state === 'complete'}
                                            readOnly
                                            className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                         />
                                         <span className={`text-sm ${item.state === 'complete' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                             {item.name}
                                         </span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    ))}
                </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
             {/* We can add actions here if needed, but for read-only just viewing */}
             <div className="text-xs text-gray-400">
                 <p>Created: {new Date(parseInt(card.id.substring(0, 8), 16) * 1000).toLocaleDateString()}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper (duplicated for simplicity, ideally utils file)
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
  };
  return colors[colorName] || '#b3bac5';
};

export default CardModal;
