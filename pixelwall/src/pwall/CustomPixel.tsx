type PixelProps = {
  colIndex: number;
  rowIndex: number;
  className: string;
  handleCellClick: () => void;
};
export function Pixel({ className, handleCellClick }: PixelProps) {
  return (
    <div className={`cell ${className}`} onClick={() => handleCellClick()} />
  );
}
