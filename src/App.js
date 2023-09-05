import React, { useState, useEffect } from 'react';
import './App.css';

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      <span className="square-content">
        <span className="square-value">{value}</span>
      </span>
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function AIPlayer(squares) {
  const aiPlayer = 'O';
  const humanPlayer = 'X';

  function minimax(newSquares, player) {
    const winner = calculateWinner(newSquares);
    if (winner === aiPlayer) {
      return { score: 1 };
    } else if (winner === humanPlayer) {
      return { score: -1 };
    } else if (isBoardFull(newSquares)) {
      return { score: 0 };
    }

    const moves = [];

    for (let i = 0; i < newSquares.length; i++) {
      if (!newSquares[i]) {
        const move = {};
        move.index = i;

        newSquares[i] = player;

        if (player === aiPlayer) {
          const result = minimax(newSquares, humanPlayer);
          move.score = result.score;
        } else {
          const result = minimax(newSquares, aiPlayer);
          move.score = result.score;
        }

        newSquares[i] = null;
        moves.push(move);
      }
    }

    let bestMove;
    if (player === aiPlayer) {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  }

  function isBoardFull(squares) {
    return squares.every((square) => square !== null);
  }

  const bestMove = minimax([...squares], aiPlayer);

  return bestMove.index;
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  useEffect(() => {
    if (!isMultiplayer && !xIsNext) {
      const aiMoveIndex = AIPlayer(currentSquares);
      const nextSquares = [...currentSquares];
      nextSquares[aiMoveIndex] = 'O';
      handlePlay(nextSquares);
    }
  }, [currentSquares, xIsNext, isMultiplayer]);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const handleSinglePlayerClick = () => {
    setIsMultiplayer(false);
    setGameStarted(true);
  };

  const handleMultiplayerClick = () => {
    setIsMultiplayer(true);
    setGameStarted(true);
  };

  const startOver = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setIsMultiplayer(false);
    setGameStarted(false);
  };

  const buttons = !gameStarted ? (
    <div>
      <button onClick={handleSinglePlayerClick} style={{ marginRight: '10px' }}>
        Single Player
      </button>
      <button onClick={handleMultiplayerClick}>Multiplayer</button>
    </div>
  ) : null;

  const startOverButton = gameStarted ? (
    <div>
      <button onClick={startOver}>Start Over</button>
    </div>
  ) : null;

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        {buttons}
        {startOverButton}
        <ol>{moves}</ol>
      </div>
    </div>
  );
}
