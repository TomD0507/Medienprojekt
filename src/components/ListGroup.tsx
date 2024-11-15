import { useState } from "react";

interface Props {
  items: string[];
  heading: string;
  onSelectItem: (item: string) => void;
}

function ListGroup({ items, heading, onSelectItem }: Props) {
  const getMessage = () => {
    return items.length == 0 ? <p> No items in the list</p> : null;
  };
  /*const arr = useState(-1);
  arr[0]; //variable
  arr[1]; // updateFunction
  */
  const [selectedIndex, setSelectedIndex] = useState(-1);
  return (
    <>
      <h1>{heading}</h1>
      {getMessage()}
      {
        items.length === 0 && <p> No items in the list</p> // das selbe wie die      function aber cleaner
      }
      <ul className="list-group">
        {items.map((item, index) => (
          <li
            key={item}
            onClick={() => {
              onSelectItem(index === selectedIndex ? "" : item);
              setSelectedIndex(index === selectedIndex ? -1 : index);
            }}
            className={
              selectedIndex === index
                ? "list-group-item active"
                : "list-group-item"
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}
export default ListGroup;
