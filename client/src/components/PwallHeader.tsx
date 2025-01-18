import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
type PwallHeaderProps = { remainingPixel: number };

export function PwallHeader({ remainingPixel }: PwallHeaderProps) {
  return (
    <header className="app_header">
      <div className="headerrow">
        <h1 className="header-title">PixelWall</h1>
        <button className="search-button" onClick={() => {}}>
          <FontAwesomeIcon icon={faFilter} className="icon" />
        </button>
      </div>
      <div className="currentfilterview"></div>
    </header>
  );
}
