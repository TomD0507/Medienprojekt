import "../styles/BurgerMenu.css";
import "../styles/MailModal.css";

import { useState } from "react";

type MailModalProps = {
  thisMailModal: boolean;
  toggleMailModal: () => void;
};

export default function MailModal({
  thisMailModal,
  toggleMailModal,
}: MailModalProps) {
  const [email, setEmail] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  if (thisMailModal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }
  return (
    <div>
      {thisMailModal && (
        <div className="modal">
          <div className="mail-overlay" onClick={toggleMailModal}></div>
          <div className="email-content">
            <h2 className="mail-header">E-Mail eingeben oder ändern</h2>
            <p>Hier kannst du deine E-Mail ändern</p>
            <input
              type="text"
              value={email}
              onChange={handleInputChange}
              placeholder="z.B. maxmustermann@gmail.com"
              className="email-input"
            ></input>
            <button className="overlay-close" onClick={toggleMailModal}>
              <span className="x"></span>
            </button>
            <button>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}
