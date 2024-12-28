import { useState } from "react";
import { Pixel } from "./CustomPixel";
import "./PixelWall.css";
export function // PixelWall(userID:number) {
PixelWall() {
  const rows = 35; // Number of rows
  const cols = 35; // Number of columns

  // Initialize a 2D array
  const createGrid = () => {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => "")
    );
  };

  const [grid, setGrid] = useState(createGrid());

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    const newGrid = [...grid];
    newGrid[row][col] = newGrid[row][col] === "active" ? "" : "active";
    setGrid(newGrid);
  };

  return (
    <div className="drawing-board">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <Pixel
              key={colIndex}
              colIndex={colIndex}
              rowIndex={rowIndex}
              className={cell}
              handleCellClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
