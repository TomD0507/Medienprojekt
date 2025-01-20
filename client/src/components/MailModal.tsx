import "../styles/BurgerMenu.css";
import "../styles/MailModal.css";

import { API_URL } from "../App";

import { useState } from "react";
import axios from "axios";

type MailModalProps = {
  thisMailModal: boolean;
  toggleMailModal: () => void;
  name: string;
  password: string;
};

export default function MailModal({
  thisMailModal,
  toggleMailModal,
  name,
  password,
}: MailModalProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false); // Zustand für Checkbox
  const handlePrivacyConsent = (event: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setPrivacyConsent(event.target.checked);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(e.target.value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = () => {
    if (emailError || !email) {
      alert("Bitte gib eine gültige E-Mail-Adresse ein.");
    } else {
      alert(`E-Mail ${email} wurde erfolgreich eingereicht.`);
      axios
        .post(`${API_URL}/update-email`, { email, name, password })
        .then((r) => {
          console.log(r);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleDelete = () => {
    axios
      .post(`${API_URL}/delete-email`, { name, password })
      .then((r) => {
        console.log(r);
      })
      .catch((err) => {
        console.log(err);
      });
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
              className={`email-input ${emailError ? "input-error" : ""}`}
            ></input>
            {emailError && <p className="error-text">{emailError}</p>}
            <button className="overlay-close-mail" onClick={toggleMailModal}>
              <span className="x"></span>
            </button>
            <div className="privacy-info">
              <input
                type="checkbox"
                id="privacyConsent"
                checked={privacyConsent}
                onChange={handlePrivacyConsent}
              />
              <label htmlFor="privacyConsent">
                Hiermit stimme ich zu, dass meine E-Mail bis zum Studienende, oder bis
                ich sie explizit lösche, gespeichert wird und ich E-Mails
                erhalten kann.
              </label>
              <p className="privacy-text">
                Hinweis: Deine E-Mail-Adresse wird ausschließlich für die
                Erinnerungsfunktion der ToDo-Liste im Rahmen der Studie
                verwendet und nach Studienende gelöscht.
              </p>
            </div>
            <div className="button-container">
              <button
                className="save-button"
                onClick={handleSubmit}
                disabled={!privacyConsent}
              >
                Speichern
              </button>
              <button className="delete-button" onClick={handleDelete}>
                Gespeicherte Mail Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
