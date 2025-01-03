type PixelProps = {
  colIndex: number;
  rowIndex: number;
  frontcolor: string;
  backcolor: string;
  className: string;
  handleCellClick: () => void;
};
export function Pixel({
  frontcolor,
  backcolor,
  className,
  handleCellClick,
}: PixelProps) {
  return (
    <div className="pixelcontainer">
      <div
        className="bgcell"
        style={{
          backgroundColor: backcolor,
        }}
      />
      <div
        className={`fgcell ${className}`}
        style={{
          backgroundColor: frontcolor,
        }}
        onClick={() => handleCellClick()}
      />
    </div>
  );
}
