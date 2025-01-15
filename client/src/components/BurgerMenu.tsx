import { faAt, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type BurgerMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: (arg: boolean) => void;
  onLogout: () => void;
  toggleMailModal: () => void;
};
function BurgerMenu({
  isMenuOpen,
  setIsMenuOpen,
  onLogout,
  toggleMailModal,
}: BurgerMenuProps) {
  return (
    isMenuOpen && (
      <div className="overlay">
        <div
          className="overlay-backdrop"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        ></div>
        <div className="menu-overlay">
          <div className="app-options">
            {/* E-Mail Modal Button*/}
            <button className="button-menu" onClick={toggleMailModal}>
              <div className="button-icon">
                <FontAwesomeIcon icon={faAt} />
              </div>
              <p className="button-text">E-Mail hinzufügen/ändern</p>
            </button>

            <div>
              {/* Trennlinie */}
              <hr className="divider" />

              {/* Logout-Button */}
              <button
                className="logout"
                onClick={() => {
                  onLogout();
                }}
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="icon" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
export default BurgerMenu;
