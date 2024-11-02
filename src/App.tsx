import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "./Button";

const colorCss = [
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #F07461 50%, #F07461 100%)",
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #64C2AF 50%, #64C2AF 100%)",
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #F8D278 50%, #F8D278 100%)",
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #474E59 50%, #474E59 100%)",
  "#F5D359",
];

const App: React.FC = () => {
  const [gridSizeW, setGridSizeW] = useState<number>(9); // グリッドの幅
  const [gridSizeH, setGridSizeH] = useState<number>(8); // グリッドの高さ

  const [grid, setGrid] = useState<number[][]>([
    [4, 4, 4, 4, 4, 4, 4, 4, 4],
    [4, 4, 0, 0, 4, 0, 0, 4, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 0, 4],
    [4, 4, 0, 0, 0, 0, 0, 4, 4],
    [4, 4, 4, 0, 0, 0, 4, 4, 4],
    [4, 4, 4, 4, 0, 4, 4, 4, 4],
    [4, 4, 4, 4, 4, 4, 4, 4, 4],
  ]);
  const [selectedColor, setSelectedColor] = useState<number>(0); // 初期選択色
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

  const handleGridSizeWChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSize = Number(event.target.value);
    setGridSizeW(newSize);
  };

  useEffect(() => {
    // 新しいサイズのグリッドを生成し、既存の色を保持する
    const newGrid = Array.from({ length: gridSizeH }, (_, rowIndex) =>
      Array.from({ length: gridSizeW }, (_, colIndex) => {
        // 既存のグリッドのサイズを考慮して色を設定
        return rowIndex < grid.length && colIndex < grid[rowIndex].length
          ? grid[rowIndex][colIndex]
          : 4; // 新しいセルは初期色に設定
      })
    );
    setGrid(newGrid);
  }, [gridSizeW, gridSizeH]);

  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const sendDot = async () => {
    setLoadState("loading");
    let res = undefined;
    for (let i = 0; i < grid.length; i++) {
      setTimeout(() => {
        const reqBody = { content: grid[i].join(",") };
        res = fetch("https://***", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "dot-generator made by n4mlz",
          },
          body: JSON.stringify(reqBody),
        });
      }, i);
    }
    await res;
    setLoadState("success");
    setTimeout(() => {
      setLoadState("idle");
    }, 2000);
  };

  return (
    <div className="app" onMouseUp={handleMouseUp}>
      <h1>ドット絵エディタ</h1>
      <div className="main-wrapper">
        <div className="dot-editor">
          <div className="size-selector">
            <label>
              グリッドの幅 (1〜10):
              <input
                type="number"
                min="1"
                max="10"
                value={gridSizeW}
                onChange={handleGridSizeWChange}
              />
            </label>
            <label>
              グリッドの高さ (1〜10):
              <input
                type="number"
                min="1"
                max="10"
                value={gridSizeH}
                onChange={(event) => setGridSizeH(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="color-picker">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="color-swatch"
                style={{
                  background: colorCss[index],
                  border: selectedColor === index ? "3px solid black" : "none",
                }}
                onClick={() => setSelectedColor(index)}
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
                    style={{ background: colorCss[color] }}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  />
                ))}
              </div>
            ))}
          </div>
          <Button loadState={loadState} onClick={sendDot} />
        </div>
        <div className="preview">
          <div className="iframe-wrapper">
            <iframe src="https://live.sohosai.com" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
