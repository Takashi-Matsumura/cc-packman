"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./PackmanGame.module.css";

// Game constants
const CELL_SIZE = 20;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 15;
const GHOST_COUNT = 3;

// Direction constants
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Game map: 0 = empty, 1 = wall, 2 = dot
const initialMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  position: Position;
  direction: Position;
  color: string;
}

const PackmanGame = () => {
  const [gameMap, setGameMap] = useState<number[][]>([]);
  const [packman, setPackman] = useState<Position>({ x: 1, y: 1 });
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [direction, setDirection] = useState<Position>(DIRECTIONS.RIGHT);
  const gameLoopRef = useRef<number | null>(null);

  // Initialize the game
  useEffect(() => {
    setGameMap([...initialMap]);
    
    // Initialize packman at a valid position
    setPackman({ x: 1, y: 1 });
    
    // Initialize ghosts with random positions
    const newGhosts: Ghost[] = [];
    const ghostColors = ['red', 'pink', 'cyan', 'orange'];
    
    for (let i = 0; i < GHOST_COUNT; i++) {
      // Set ghosts at different corners
      let ghostPos;
      switch (i % 4) {
        case 0: ghostPos = { x: 18, y: 1 }; break;  // top-right
        case 1: ghostPos = { x: 1, y: 13 }; break;  // bottom-left
        case 2: ghostPos = { x: 18, y: 13 }; break; // bottom-right
        case 3: ghostPos = { x: 10, y: 8 }; break;  // middle
      }
      
      newGhosts.push({
        position: ghostPos,
        direction: getRandomDirection(),
        color: ghostColors[i % ghostColors.length],
      });
    }
    
    setGhosts(newGhosts);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Handle keyboard inputs for packman movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
          setDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
          setDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
          setDirection(DIRECTIONS.RIGHT);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver || gameWon) return;

    const runGameLoop = () => {
      movePackman();
      moveGhosts();
      checkCollisions();
      checkWinCondition();
      
      gameLoopRef.current = requestAnimationFrame(runGameLoop);
    };

    const gameLoopId = setTimeout(() => {
      runGameLoop();
    }, 200); // Game speed - adjust as needed
    
    return () => {
      clearTimeout(gameLoopId);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [packman, ghosts, gameMap, gameOver, gameWon]);

  // Move packman based on current direction
  const movePackman = () => {
    const newPos = {
      x: packman.x + direction.x,
      y: packman.y + direction.y
    };

    // Check if the new position is valid (not a wall)
    if (newPos.x >= 0 && newPos.x < GRID_WIDTH && 
        newPos.y >= 0 && newPos.y < GRID_HEIGHT && 
        gameMap[newPos.y][newPos.x] !== 1) {
      
      // Update score if packman eats a dot
      if (gameMap[newPos.y][newPos.x] === 2) {
        const newMap = [...gameMap];
        newMap[newPos.y][newPos.x] = 0; // Remove the dot
        setGameMap(newMap);
        setScore(prevScore => prevScore + 10);
      }
      
      setPackman(newPos);
    }
  };

  // Move ghosts randomly
  const moveGhosts = () => {
    const newGhosts = ghosts.map(ghost => {
      let newDirection = ghost.direction;
      let newPos = {
        x: ghost.position.x + ghost.direction.x,
        y: ghost.position.y + ghost.direction.y
      };

      // If ghost hits a wall or randomly (20% chance), change direction
      if (newPos.x < 0 || newPos.x >= GRID_WIDTH || 
          newPos.y < 0 || newPos.y >= GRID_HEIGHT || 
          gameMap[newPos.y][newPos.x] === 1 || 
          Math.random() < 0.2) {
        
        newDirection = getRandomDirection();
        newPos = {
          x: ghost.position.x + newDirection.x,
          y: ghost.position.y + newDirection.y
        };

        // If new position is still invalid, keep the ghost in place
        if (newPos.x < 0 || newPos.x >= GRID_WIDTH || 
            newPos.y < 0 || newPos.y >= GRID_HEIGHT || 
            gameMap[newPos.y][newPos.x] === 1) {
          return ghost;
        }
      }

      return {
        ...ghost,
        position: newPos,
        direction: newDirection
      };
    });

    setGhosts(newGhosts);
  };

  // Check if packman collided with a ghost
  const checkCollisions = () => {
    for (const ghost of ghosts) {
      if (ghost.position.x === packman.x && ghost.position.y === packman.y) {
        setGameOver(true);
        break;
      }
    }
  };

  // Check if all dots are collected
  const checkWinCondition = () => {
    // Check if there are any dots left
    let dotsRemaining = false;
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (gameMap[y][x] === 2) {
          dotsRemaining = true;
          break;
        }
      }
      if (dotsRemaining) break;
    }
    
    if (!dotsRemaining) {
      setGameWon(true);
    }
  };

  // Helper function to get a random direction
  const getRandomDirection = () => {
    const directions = Object.values(DIRECTIONS);
    return directions[Math.floor(Math.random() * directions.length)];
  };

  // Reset the game
  const resetGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    setGameMap([...initialMap]);
    setPackman({ x: 1, y: 1 });
    
    const newGhosts: Ghost[] = [];
    const ghostColors = ['red', 'pink', 'cyan', 'orange'];
    
    for (let i = 0; i < GHOST_COUNT; i++) {
      let ghostPos;
      switch (i % 4) {
        case 0: ghostPos = { x: 18, y: 1 }; break;
        case 1: ghostPos = { x: 1, y: 13 }; break;
        case 2: ghostPos = { x: 18, y: 13 }; break;
        case 3: ghostPos = { x: 10, y: 8 }; break;
      }
      
      newGhosts.push({
        position: ghostPos,
        direction: getRandomDirection(),
        color: ghostColors[i % ghostColors.length],
      });
    }
    
    setGhosts(newGhosts);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setDirection(DIRECTIONS.RIGHT);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-lg">Score: {score}</div>
      
      <div className={styles.gameContainer} style={{
        width: CELL_SIZE * GRID_WIDTH,
        height: CELL_SIZE * GRID_HEIGHT,
        position: 'relative',
        background: '#111',
        border: '2px solid #333',
      }}>
        {/* Render map */}
        {gameMap.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell === 1 ? '#333' : 'transparent',
              }}
            >
              {cell === 2 && (
                <div style={{
                  position: 'absolute',
                  left: CELL_SIZE / 2 - 2,
                  top: CELL_SIZE / 2 - 2,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: '#FFF',
                }} />
              )}
            </div>
          ))
        ))}
        
        {/* Render packman */}
        <div style={{
          position: 'absolute',
          left: packman.x * CELL_SIZE,
          top: packman.y * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE,
          borderRadius: '50%',
          backgroundColor: 'yellow',
        }} />
        
        {/* Render ghosts */}
        {ghosts.map((ghost, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: ghost.position.x * CELL_SIZE,
              top: ghost.position.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderRadius: '50% 50% 0 0',
              backgroundColor: ghost.color,
            }}
          />
        ))}
        
        {/* Game over overlay */}
        {gameOver && (
          <div className={styles.overlay}>
            <div className="text-2xl mb-4 text-red-500">Game Over!</div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
        
        {/* Win overlay */}
        {gameWon && (
          <div className={styles.overlay}>
            <div className="text-2xl mb-4 text-green-500">You Win!</div>
            <div className="mb-4">Score: {score}</div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 text-center">
        <div className="mb-2">Use arrow keys to move</div>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
          onClick={resetGame}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default PackmanGame;