export function GameFilter({ selectedGame, onGameChange }) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-4">
      {gameOptions.map(game => (
        <button
          key={game.id}
          onClick={() => onGameChange(game.id)}
          className={`px-4 py-2 rounded-xl transition-all
            ${selectedGame === game.id 
              ? 'bg-emerald-500 text-white' 
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
        >
          <span className="mr-2">{game.icon}</span>
          {game.name}
        </button>
      ))}
    </div>
  );
} 