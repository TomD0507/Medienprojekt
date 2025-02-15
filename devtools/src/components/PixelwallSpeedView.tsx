import { useEffect, useState } from "react";
import "./PixelWall.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
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

const currentUserID = 0;

export function PixelWallSpeedView() {
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
        if (data) {
          const newDates = new Set<Date>();
          newDates.add(new Date());
          Object.keys(data).forEach((userIdStr) => {
            const userId = Number(userIdStr);
            const userPixels: {
              xCoordinate: number;
              yCoordinate: number;
              color: string;
              timestamp: Date;
            }[] = data[userId] || [];
            userPixels.forEach(({ timestamp }) => {
              newDates.add(timestamp);
            });
          });
          setavailableDates(Array.from(newDates).sort());
        }
      }
    };
    // Fetch data initially
    fetchAndSetData();
  }, [currentUserID]);
  const [availableDates, setavailableDates] = useState([new Date()]);

  const [currentIndex, setCurrentIndex] = useState(0);

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
          if (new Date(timestamp) > new Date(availableDates[currentIndex])) {
          } else if (new Date(timestamp) > new Date(currentPixel.timestamp)) {
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
  }, [selectedUsers, userPixelData, currentIndex]);

  const [zoomLevel, setZoomLevel] = useState(0.5);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 2.8)); // Max zoom level 3x
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.3)); // Min zoom level 0.5x
  return (
    <>
      <div className="options_container">
        <div className="pw-buttons-container">
          <span className="text-lg font-semibold">
            {availableDates.length > 0
              ? new Date(availableDates[currentIndex]).toLocaleDateString()
              : "No Dates Available"}
          </span>
          <input
            type="range"
            min="0"
            max={availableDates.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            className="w-64"
          />
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

      {/* Pixel Grid */}

      <div className="zoom-container">
        <div
          className="drawing-board"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "0 0" }}
        >
          {grid.map((row) =>
            row.map((cell) => (
              <div className="pixelcontainer">
                <div
                  className="bgcell"
                  style={{
                    backgroundColor: cell.backcolor,
                  }}
                />
              </div>
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
