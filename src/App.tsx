import React, { useState, useEffect } from "react";
import "./App.css";
import clipboardCopy from "clipboard-copy";

const colorCss = [
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #F07461 50%, #F07461 100%)",
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #64C2AF 50%, #64C2AF 100%)",
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #F8D278 50%, #F8D278 100%)",
  "linear-gradient(-30deg, #1EB8CB 0%, #1EB8CB 50%, #474E59 50%, #474E59 100%)",
  "#F5D359",
];

const App: React.FC = () => {
  const [gridSizeW, setGridSizeW] = useState<number>(9);
  const [gridSizeH, setGridSizeH] = useState<number>(8);

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
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [isPainting, setIsPainting] = useState(false);

  const drawCell = (row: number, col: number) => {
    const newGrid = grid.map((r, rIndex) =>
      rIndex === row
        ? r.map((color, cIndex) => (cIndex === col ? selectedColor : color))
        : r
    );
    setGrid(newGrid);
    setResultText(generateResultText());
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
    const newGrid = Array.from({ length: gridSizeH }, (_, rowIndex) =>
      Array.from({ length: gridSizeW }, (_, colIndex) => {
        return rowIndex < grid.length && colIndex < grid[rowIndex].length
          ? grid[rowIndex][colIndex]
          : 4;
      })
    );
    setGrid(newGrid);
  }, [gridSizeW, gridSizeH]);

  const generateResultText = () => {
    const command = grid
      .map((row) => row.join(","))
      .map(
        (row) =>
          `curl 'https://live-api.sohosai.com/reaction' -X POST -H 'User-Agent: Dot-Generator made by n4mlz' --data-raw '{"content":"${row}"}'`
      )
      .join("\n");
    return command;
  };

  const [resultText, setResultText] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = () => {
    clipboardCopy(resultText).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    });
  };

  useEffect(() => {
    setResultText(generateResultText());
  }, []);

  return (
    <div className="app" onMouseUp={handleMouseUp}>
      <h1 className="title">謎のドット絵エディタ</h1>
      <div className="main-wrapper">
        <div className="dot-editor">
          <div className="editor">
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
                    border:
                      selectedColor === index ? "3px solid black" : "none",
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
          </div>
          <div className="result-wrapper">
            <button
              className={`copy-button ${isCopied && "copied"}`}
              onClick={handleCopy}
            >
              {isCopied ? "コピーしました！" : "コピー"}
            </button>
            <div className="result">{resultText}</div>
          </div>
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
