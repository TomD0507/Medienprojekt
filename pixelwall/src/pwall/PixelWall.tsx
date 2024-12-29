import { useState } from "react";
import { Pixel } from "./CustomPixel";
import "./PixelWall.css";
export function // PixelWall(userID:number) {
PixelWall() {
  //todo: pixel count
  //todo : auswahl für stif und radierer
  const rows = 35; // Number of rows
  const cols = 35; // Number of columns
  const [selectedColor, setSelectedColor] = useState("#000000"); // Standardfarbe

  // Initialize a 2D array
  const createGrid = () => {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        frontcolor: "",
        backcolor: "white",
      }))
    );
  };

  const [grid, setGrid] = useState(createGrid());

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    //todo: überprüfen radierer oder stift
    //todo: wenn stift dann nur ändern, wenn bereits bemalt oder wenn pixel übrig und dann auch pixel -1
    setGrid((prev) => {
      return [
        ...prev.slice(0, row),
        [
          ...prev[row].slice(0, col),
          { frontcolor: selectedColor, backcolor: prev[row][col].backcolor },
          ...prev[row].slice(col + 1),
        ],
        ...prev.slice(row + 1),
      ];
    });
  };

  return (
    <>
      <label>
        Wähle eine Farbe:{" "}
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        />
      </label>
      <div className="drawing-board">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <Pixel
                key={colIndex}
                colIndex={colIndex}
                rowIndex={rowIndex}
                className={cell.frontcolor === "" ? "" : "active"}
                handleCellClick={() => handleCellClick(rowIndex, colIndex)}
                frontcolor={cell.frontcolor}
                backcolor={cell.backcolor}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
