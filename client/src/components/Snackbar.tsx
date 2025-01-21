import "../styles/Snackbar.css"; // CSS für das Styling
type SnackbarProps = {
  message: string;
  onClose: () => void;
};
export const Snackbar = ({ message, onClose }: SnackbarProps) => {
  return (
    <div className="snackbar">
      {message}
      <button onClick={onClose} className="snackbar-close">
        &times;
      </button>
    </div>
  );
};
