import * as React from "react";
import { useLongPress } from "@uidotdev/usehooks";

export default function App2() {
  const [isOpen, setIsOpen] = React.useState(false);
  const attrs = useLongPress(
    () => {
      setIsOpen(true);
    },
    {
      onStart: (event) => console.log("Press started"),
      onFinish: (event) => console.log("Press Finished"),
      onCancel: (event) => console.log("Press cancelled"),
      threshold: 500,
    }
  );

  return (
    <div>
      useLongPress
      <button {...attrs}>Press Me</button>
      {isOpen && (
        <div>
          <button onClick={() => setIsOpen(false)}>Close</button>
          <p>Modal triggered by a long press.</p>
        </div>
      )}
    </div>
  );
}
