import { useEffect, useRef, useState } from "react";
import { Pixel } from "./CustomPixel";
import "./PixelWall.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEraser,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../App";

import axios from "axios";

type PixelData = {
  xCoordinate: number;
  yCoordinate: number;
  color: string;
  timestamp: Date;
};

async function fetchPixelData(id: number): Promise<{
  [userID: number]: PixelData[];
} | null> {
  try {
    const response = await axios.get(`${API_URL}/pixels`, { params: { id } });

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
  remainingPixel: number;
  username: string;
  password: string;
  removePixels: (arg: number) => void;
};
export function PixelWall({
  currentUserID,
  remainingPixel,
  username,
  password,
  removePixels,
}: PixelWallProps) {
  const predefinedColors = [
    // Primary Colors
    "#ff0000", // Red
    "#00ff00", // Green
    "#0000ff", // Blue

    // Secondary Colors
    "#ffff00", // Yellow
    "#ff00ff", // Magenta
    "#00ffff", // Cyan

    // Neutral Colors
    "#000000", // Black
    "#ffffff", // White
    "#808080", // Gray

    // Warm Colors
    "#ffa500", // Orange
    "#ffdab9", // PeachPuff

    // Pastel Colors
    "#ffd700", // Gold

    // Vivid Colors
    "#dc143c", // Crimson
    "#8a2be2", // BlueViolet
    "#ff1493", // DeepPink
    "#1e90ff", // DodgerBlue

    // Earthy Tones
    "#a0522d", // Sienna
    "#deb887", // Burlywood

    // Additional Colors
    "#c71585", // MediumVioletRed
    "#6a5acd", // SlateBlue
    "#2e8b57", // SeaGreen
  ];

  const [selectedColor, setSelectedColor] = useState("#000000"); // Standardfarbe
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [userPixelData, setUserPixelData] = useState<{
    [userID: number]: {
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
  async function pushDrawing(pixels: string[][]) {
    const changes: {
      xCoordinate: number;
      yCoordinate: number;
      color: string;
      timestamp: Date;
    }[] = [];
    // Filter all pixels, that the user drawed to
    pixels.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== "transparent") {
          changes.push({
            xCoordinate: x,
            yCoordinate: y,
            color: cell,
            timestamp: new Date(),
          });
        }
      });
    });

    // Update local userPixelData immediately
    if (changes.length == 0) return;

    // Send pixels to the backend
    try {
      // Use axios to make the POST request
      await axios
        .post(
          `${API_URL}/pixels/submit`,
          { username, password, changes },
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((_response) => {
          setFrontendPixels(createFrontendGrid());

          setUserPixelData((prev) => {
            const updatedData = { ...prev };
            if (!updatedData[currentUserID]) {
              updatedData[currentUserID] = [];
            }
            updatedData[currentUserID] = [
              ...updatedData[currentUserID],
              ...changes.map((pixel) => ({
                xCoordinate: pixel.xCoordinate,
                yCoordinate: pixel.yCoordinate,
                color: pixel.color,
                timestamp: pixel.timestamp,
              })),
            ];
            return updatedData;
          });
          removePixels(changes.length);
        });

      // Reset local pixels after successful submission
    } catch (error) {
      console.error("Error submitting pixel changes:", error);
    }
  }

  useEffect(() => {
    const fetchAndSetData = async () => {
      console.log("id", currentUserID);
      if (currentUserID != null) {
        const data = await fetchPixelData(currentUserID);
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

          return updated ? updatedUsers : prev;
        });
      }
    };
    // Fetch data initially
    fetchAndSetData();

    // Set up periodic fetching
    const intervalId = setInterval(fetchAndSetData, 15000); // Fetch every 15 seconds

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
          xCoordinate: number;
          yCoordinate: number;
          color: string;
          timestamp: Date;
        }[] = userPixelData[id] || [];
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

  const frontendPixelsRef = useRef(frontendPixels);

  useEffect(() => {
    frontendPixelsRef.current = frontendPixels; // Immer den aktuellen Stand speichern
  }, [frontendPixels]);

  useEffect(() => {
    return () => {
      if (
        frontendPixelsRef.current.some((row) =>
          row.some((cell) => cell !== "transparent")
        )
      ) {
        pushDrawing(frontendPixelsRef.current); // Hier übergeben wir die aktuelle Version
      }
    };
  }, []);

  useEffect(() => {
    const updatedGrid = getNewestPixels();
    setGrid(updatedGrid);
  }, [selectedUsers, userPixelData]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    setFrontendPixels((prev) => {
      return [
        ...prev.slice(0, row),
        [
          ...prev[row].slice(0, col),
          drawing
            ? prev.flat().filter((v) => v !== "transparent").length >=
              remainingPixel
              ? prev[row][col]
              : selectedColor
            : "transparent",
          ...prev[row].slice(col + 1),
        ],
        ...prev.slice(row + 1),
      ];
    });
  };
  const [zoomLevel, setZoomLevel] = useState(0.5);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 2.8)); // Max zoom level 3x
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.3)); // Min zoom level 0.5x

  return (
    <>
      <div className="options_container">
        <label>
          {" "}
          <button
            className="pwbuttons"
            onClick={() => pushDrawing(frontendPixels)}
          >
            Save:{" "}
            <span style={{ color: "#ffb41e" }}>
              {frontendPixels.flat().filter((v) => v !== "transparent").length}
            </span>
            {" / " + remainingPixel}
          </button>
        </label>
        <div className="pw-buttons-container">
          <label>
            {" "}
            <button
              className="penbutton "
              onClick={() => setDrawing(true)}
              disabled={drawing}
            >
              <FontAwesomeIcon icon={faPen} className="icon" />
            </button>
            <label>
              <div>
                <button
                  className="pwbuttons "
                  key={"selected"}
                  style={{
                    backgroundColor: selectedColor,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectionOpen(true);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faPen}
                    className="icon icon-invisible"
                  />
                </button>
              </div>
            </label>
          </label>
          <label>
            {" "}
            <button
              className="erasebutton"
              onClick={() => setDrawing(false)}
              disabled={!drawing}
            >
              <FontAwesomeIcon icon={faEraser} className="icon" />
            </button>
          </label>
        </div>
        <div className="pw-buttons-container">
          <button className="pwbuttons" onClick={handleZoomIn}>
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
          </button>
          <button className="pwbuttons" onClick={handleZoomOut}>
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
          </button>
        </div>
      </div>
      {selectionOpen && (
        <>
          <div
            className="overlay-backdropselection"
            onClick={() => {
              setSelectionOpen(false);
            }}
          ></div>
          <div className="dropdown">
            <div className="colorSelection">
              {predefinedColors.map((color) => (
                <button
                  className="coloroption"
                  key={color}
                  style={{
                    backgroundColor: color,
                    outline:
                      selectedColor === color ? "2px solid black" : "none",
                  }}
                  onClick={() => {
                    setSelectionOpen(false);
                    setSelectedColor(color);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
      {/* Pixel Grid */}

      <div className="zoom-container">
        <div
          className="drawing-board"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "0 0" }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
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
            ))
          )}
        </div>
      </div>
      {/* User Selection */}
      <div className="user_selection_container">
        {/* nur Eigener User */}
        <label
          className="pwbuttons usersel"
          key={"only" + currentUserID}
          onClick={() => {
            setSelectedUsers((prev) => {
              const updatedMap = new Map(prev); // Create a copy of the map
              updatedMap.forEach((_value: boolean, key: number) => {
                if (key == currentUserID) {
                  updatedMap.set(key, true);
                } else {
                  updatedMap.set(key, false);
                }
              }); // Update the active status

              return updatedMap;
            });
          }}
        >
          {` Nur Eigene `}
        </label>
        {/* Eigener User */}
        <label className="pwbuttons usersel" key={currentUserID}>
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
          {` Eigene (${currentUserID})`}
        </label>

        {/* User Selection andere user */}

        {Array.from(selectedUsers.entries()).map(([id, active]) => {
          const userId = id; // Convert string key back to a number(
          if (userId == currentUserID) return;
          return (
            <label className="pwbuttons usersel" key={userId}>
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
              {` User ${userId}`}
            </label>
          );
        })}
      </div>
    </>
  );
}
