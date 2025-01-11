import { useEffect, useState } from "react";
import { Pixel } from "./CustomPixel";
import "./PixelWall.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faPen } from "@fortawesome/free-solid-svg-icons";
async function fetchPixelData() {
  try {
    const response = await fetch("/api/pixels");

    // Check if response is JSON
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null; // Return null if there's an error
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Response is not JSON");
      return null; // Return null if there's an error
    }

    const data = await response.json(); // Parse JSON only if valid
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching pixel data:", error);
    return null; // Return null if there's an error
  }
}
const rows = 35; // Number of rows
const cols = 35; // Number of columns

// Initialize a 2D array
const createGrid = () => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      frontcolor: "transparent",
      backcolor: "white",
      timestamp: new Date(0),
    }))
  );
};
const createFrontendGrid = () => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => "transparent")
  );
};
export function // PixelWall(userID:number) {
PixelWall(currentUserId: number) {
  //todo: pixel count

  const [selectedColor, setSelectedColor] = useState("#000000"); // Standardfarbe
  const [userPixelData, setUserPixelData] = useState<{
    [userID: number]: {
      userId: number;
      xCoordinate: number;
      yCoordinate: number;
      color: string;
      timestamp: Date;
    }[];
  }>({});
  // Map of userId -> list of pixels
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]); // List of userIds to display
  const [grid, setGrid] = useState(createGrid()); // Rendered grid based on filtered users

  const [drawing, setDrawing] = useState(true);
  function pushDrawing() {
    const changes: {
      userId: number;
      xCoordinate: number;
      yCoordinate: number;
      color: string;
      timestamp: Date;
    }[] = [];
    frontendPixels.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== "transparent") {
          changes.push({
            userId: currentUserId,
            xCoordinate: x,
            yCoordinate: y,
            color: cell,
            timestamp: new Date(),
          });
        }
      });
    });
    //todo: übertragung zu userpixe struktur

    fetch("/api/pixels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    }).then(() => {
      setFrontendPixels(createFrontendGrid()); // Reset lokale Pixel
    });
  }

  useEffect(() => {
    const fetchAndSetData = async () => {
      const data = await fetchPixelData(); // Await the fetched data
      if (data) {
        setUserPixelData(data); // Update state only if data is valid
      }
    };

    fetchAndSetData(); // Call the async function inside useEffect
  }, []);
  const [frontendPixels, setFrontendPixels] = useState<string[][]>(
    createFrontendGrid()
  ); // Lokale Frontend-Pixel

  function getNewestPixels() {
    const combinedGrid = createGrid();

    // Iterate over selected users
    selectedUsers.forEach((userId) => {
      const userPixels: {
        userId: number;
        xCoordinate: number;
        yCoordinate: number;
        color: string;
        timestamp: Date;
      }[] = userPixelData[userId] || [];
      userPixels.forEach(({ xCoordinate, yCoordinate, color, timestamp }) => {
        const currentPixel = combinedGrid[yCoordinate][xCoordinate];

        // Update if this pixel is newer
        if (
          !currentPixel.timestamp ||
          new Date(timestamp) > new Date(currentPixel.timestamp)
        ) {
          combinedGrid[yCoordinate][xCoordinate] = {
            frontcolor: "transparent",
            backcolor: color,
            timestamp,
          };
        }
      });
    });

    return combinedGrid;
  }

  useEffect(() => {
    const updatedGrid = getNewestPixels();
    setGrid(updatedGrid);
  }, [selectedUsers, userPixelData]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    console.log("cell", row, col, drawing, selectedColor);
    setFrontendPixels((prev) => {
      return [
        ...prev.slice(0, row),
        [
          ...prev[row].slice(0, col),

          drawing ? selectedColor : "transparent",
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
      <label>
        {" "}
        <button onClick={pushDrawing}>Push change:</button>
      </label>
      <label>
        {" "}
        <button onClick={() => setDrawing(true)}>
          <FontAwesomeIcon icon={faPen} className="icon" />
        </button>
      </label>
      <label>
        {" "}
        <button onClick={() => setDrawing(false)}>
          <FontAwesomeIcon icon={faEraser} className="icon" />
        </button>
      </label>
      {/* User Selection */}
      <div>
        {Object.keys(userPixelData).map((userIdStr) => {
          const userId = Number(userIdStr); // Convert string key back to a number(
          return (
            <label key={userId}>
              <input
                type="checkbox"
                value={userId}
                checked={selectedUsers.includes(userId)}
                onChange={(e) => {
                  const userId = Number(e.target.value);
                  setSelectedUsers((prev) =>
                    e.target.checked
                      ? [...prev, userId]
                      : prev.filter((id) => id !== userId)
                  );
                }}
              />
              User {userId}
            </label>
          );
        })}
      </div>

      {/* Pixel Grid */}
      <div className="drawing-board">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <Pixel
                key={colIndex}
                colIndex={colIndex}
                rowIndex={rowIndex}
                className={
                  frontendPixels[rowIndex][colIndex] === "transparent"
                    ? "transparent"
                    : "active"
                }
                frontcolor={frontendPixels[rowIndex][colIndex]}
                backcolor={cell.backcolor}
                handleCellClick={() => handleCellClick(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
