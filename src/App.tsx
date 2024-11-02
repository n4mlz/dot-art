import React, { useState, useEffect } from "react";
import "./App.css";

const colors = ["#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"]; // 色の配列

const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(10); // グリッドのサイズ
  const [grid, setGrid] = useState<string[][]>(
    Array(gridSize).fill(Array(gridSize).fill(colors[0]))
  );
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]); // 初期選択色
  const [isPainting, setIsPainting] = useState(false);

  const drawCell = (row: number, col: number) => {
    const newGrid = grid.map((r, rIndex) =>
      rIndex === row
        ? r.map((color, cIndex) => (cIndex === col ? selectedColor : color))
        : r
    );
    setGrid(newGrid);
  };

  const handleMouseDown = (row: number, col: number) => {
    setIsPainting(true);
    drawCell(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isPainting) {
      drawCell(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsPainting(false);
  };

  const handleGridSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(event.target.value);
    setGridSize(newSize);
  };

  useEffect(() => {
    // 新しいサイズのグリッドを生成し、既存の色を保持する
    const newGrid = Array.from({ length: gridSize }, (_, rowIndex) =>
      Array.from({ length: gridSize }, (_, colIndex) => {
        // 既存のグリッドのサイズを考慮して色を設定
        return rowIndex < grid.length && colIndex < grid[rowIndex].length
          ? grid[rowIndex][colIndex]
          : colors[0]; // 新しいセルは初期色に設定
      })
    );
    setGrid(newGrid);
  }, [gridSize]);

  return (
    <div className="app" onMouseUp={handleMouseUp}>
      <h1>ドット絵エディタ</h1>
      <div>
        <label>
          グリッドのサイズ (1〜10):
          <input
            type="number"
            min="1"
            max="10"
            value={gridSize}
            onChange={handleGridSizeChange}
          />
        </label>
      </div>
      <div className="color-picker">
        {colors.map((color) => (
          <div
            key={color}
            className="color-swatch"
            style={{
              backgroundColor: color,
              border: selectedColor === color ? "3px solid black" : "none",
            }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((color, colIndex) => (
              <div
                key={colIndex}
                className="cell"
                style={{ backgroundColor: color }}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
