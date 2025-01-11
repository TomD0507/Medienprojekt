import "../styles/BurgerMenu.css";
import "../styles/Overlay.css";
import "../styles/MailModal.css";

import { useState } from "react";

export default function MailModal() {

  const [thisMailModal, setMailModal] = useState(true);

  const toggleMailModal = () => {
    setMailModal(!thisMailModal);
  }

  if (thisMailModal) {
    document.body.classList.add('active-modal')
  } else {
    document.body.classList.remove('active-modal')
  }

  return (
    <div>
      {thisMailModal &&
        <div className="modal">
          <div className="mail-overlay" onClick={toggleMailModal}></div>
          <div className="email-content">
              <h2>E-Mail eingeben oder ändern</h2>
              <p>Hier kannst du deine E-Mail ändern</p>
              <button 
                className="overlay-close" 
                onClick={toggleMailModal}>
                <span className="x"></span>
              </button>
            </div>
        </div>
      }
    </div>
  )
}
