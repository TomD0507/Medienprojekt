import { useState } from "react";
import Message from "./Message";
import ListGroup from "./components/ListGroup";
function App() {
  let items = ["item1", "item", "item 7", "hello"];
  let [Header, updateFunction] = useState("Liste");
  const handleSelectItem = (item: string) => {
    console.log(item);
    updateFunction(item.length == 0 ? "Liste" : "Selected: " + item);
  };
  return (
    <div>
      <Message />
      <ListGroup
        items={items}
        heading={Header}
        onSelectItem={handleSelectItem}
      />
    </div>
  );
}
export default App;
