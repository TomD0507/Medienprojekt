import { useEffect, useState } from "react";
import { Pixel } from "./CustomPixel";
import "./PixelWall.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faPen } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../App";

import axios from "axios";

type PixelData = {
  userId: number;
  xCoordinate: number;
  yCoordinate: number;
  color: string;
  timestamp: Date;
};

async function fetchPixelData(): Promise<{
  [userID: number]: PixelData[];
} | null> {
  try {
    const response = await axios.get(`${API_URL}/pixels/get`);

    // Axios parses JSON responses automatically
    const data: { [userID: number]: PixelData[] } = response.data;

    // Validate the data structure if necessary
    if (!data || typeof data !== "object") {
      console.error("Invalid data structure received:", data);
      return null;
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`HTTP error! status: ${error.response.status}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    } else {
      console.error("An unexpected error occurred:", error);
    }
    return null;
  }
}

const rows = 35; // Number of rows
const cols = 35; // Number of columns

// Initialize a 2D array
const createGrid = () => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
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
type PixelWallProps = {
  currentUserID: number;
};
export function // PixelWall(userID:number) {
PixelWall({ currentUserID }: PixelWallProps) {
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
  const [selectedUsers, setSelectedUsers] = useState<Map<number, boolean>>(
    new Map([[currentUserID, true]])
  );

  const [grid, setGrid] = useState(createGrid()); // Rendered grid based on filtered users

  // get own drawing into the backend and wall
  const [drawing, setDrawing] = useState(true);
  async function pushDrawing() {
    const changes: {
      userId: number;
      xCoordinate: number;
      yCoordinate: number;
      color: string;
      timestamp: Date;
    }[] = [];
    // Filter all pixels, that the user drawed to
    frontendPixels.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== "transparent") {
          changes.push({
            userId: currentUserID,
            xCoordinate: x,
            yCoordinate: y,
            color: cell,
            timestamp: new Date(),
          });
        }
      });
    });

    // Update local userPixelData immediately
    setUserPixelData((prev) => {
      const updatedData = { ...prev };
      if (!updatedData[currentUserID]) {
        updatedData[currentUserID] = [];
      }
      updatedData[currentUserID] = [
        ...updatedData[currentUserID],
        ...changes.map((pixel) => ({
          userId: pixel.userId,
          xCoordinate: pixel.xCoordinate,
          yCoordinate: pixel.yCoordinate,
          color: pixel.color,
          timestamp: pixel.timestamp,
        })),
      ];
      return updatedData;
    });

    // Send pixels to the backend
    try {
      // Use axios to make the POST request
      await axios.post(`${API_URL}/pixels/submit`, changes, {
        headers: { "Content-Type": "application/json" },
      });

      // Reset local pixels after successful submission
      setFrontendPixels(createFrontendGrid());
    } catch (error) {
      console.error("Error submitting pixel changes:", error);
    }
  }

  useEffect(() => {
    const fetchAndSetData = async () => {
      const data = await fetchPixelData();
      if (data) {
        setUserPixelData(data);
      }

      // only users that have drawn (and the current user) are supposed to be an option
      setSelectedUsers((prev) => {
        const updatedUsers = new Map(); //
        let updated = false; // Track if there's any change
        // Add users from the backend, preserving their `active` status if they already exist
        if (data) {
          Object.keys(data).forEach((userIdStr) => {
            const userId = Number(userIdStr);
            if (!prev.has(userId)) {
              updatedUsers.set(userId, true); // Set to true if user is new
              updated = true;
            } else {
              updatedUsers.set(userId, prev.get(userId)); //set to old value if already existing
            }
          });
        }
        // Always ensure the `currentUserID` is present
        if (!updatedUsers.has(currentUserID)) {
          if (prev.has(currentUserID)) {
            updatedUsers.set(currentUserID, prev.get(currentUserID));
          } else {
            updatedUsers.set(currentUserID, true);
            updated = true;
          } // Set to true for currentUserID if not already existing
        }

        console.log(prev);
        console.log(updatedUsers);

        console.log(updated);
        return updated ? updatedUsers : prev;
      });
    };

    // Fetch data initially
    fetchAndSetData();

    // Set up periodic fetching
    const intervalId = setInterval(fetchAndSetData, 5000); // Fetch every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentUserID]);

  const [frontendPixels, setFrontendPixels] = useState<string[][]>(
    createFrontendGrid()
  ); // Lokale Frontend-Pixel

  function getNewestPixels() {
    const combinedGrid = createGrid();

    // Iterate over selected users
    Array.from(selectedUsers.entries()).map(([id, active]) => {
      if (active) {
        const userPixels: {
          userId: number;
          xCoordinate: number;
          yCoordinate: number;
          color: string;
          timestamp: Date;
        }[] = userPixelData[id] || [];
        console.log(userPixels);
        userPixels.forEach(({ xCoordinate, yCoordinate, color, timestamp }) => {
          const currentPixel = combinedGrid[yCoordinate][xCoordinate];

          // Update if this pixel is newer
          if (
            !currentPixel.timestamp ||
            new Date(timestamp) > new Date(currentPixel.timestamp)
          ) {
            combinedGrid[yCoordinate][xCoordinate] = {
              backcolor: color,
              timestamp,
            };
          }
        });
      }
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
      <>{currentUserID}</>
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
        <label key={currentUserID}>
          <input
            type="checkbox"
            value={currentUserID}
            checked={selectedUsers.get(currentUserID) ?? true}
            onChange={(e) => {
              setSelectedUsers((prev) => {
                const updatedMap = new Map(prev); // Create a copy of the map
                updatedMap.set(currentUserID, e.target.checked); // Update the active status
                return updatedMap;
              });
            }}
          />
          Eigene (User {currentUserID})
        </label>

        {/* User Selection */}

        {Array.from(selectedUsers.entries()).map(([id, active]) => {
          const userId = id; // Convert string key back to a number(
          if (userId == currentUserID) return;
          return (
            <label key={userId}>
              <input
                type="checkbox"
                value={userId}
                checked={active}
                onChange={(e) => {
                  setSelectedUsers((prev) => {
                    const updatedMap = new Map(prev); // Create a copy of the map
                    updatedMap.set(userId, e.target.checked); // Update the active status
                    return updatedMap;
                  });
                }}
              />
              {`User ${userId}`}
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
