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
  //TODO: darstellung front und background. front ev. mit alphavalue und back ohne. müssen übereinander liegen
  return (
    <div className={`cell ${className}`} onClick={() => handleCellClick()} />
  );
}
