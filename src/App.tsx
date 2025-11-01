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
  const [textInput, setTextInput] = useState<string>("");

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

  // 文字を8x8ビットマップに変換する関数
  const convertCharToBitmap = (char: string): number[][] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return Array(8).fill(Array(8).fill(4));

    canvas.width = 8;
    canvas.height = 8;

    // 背景をクリア
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 8, 8);

    // みさきフォントで文字を描画
    ctx.fillStyle = 'black';
    ctx.font = '8px Misaki';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(char, 0, 0);

    // ピクセルデータを取得
    const imageData = ctx.getImageData(0, 0, 8, 8);
    const pixels = imageData.data;

    // 8x8の配列に変換（しきい値処理）
    const bitmap: number[][] = [];
    for (let y = 0; y < 8; y++) {
      const row: number[] = [];
      for (let x = 0; x < 8; x++) {
        const index = (y * 8 + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        // RGBの平均が128未満なら黒（ドットあり）
        const brightness = (r + g + b) / 3;
        row.push(brightness < 128 ? selectedColor : 4);
      }
      bitmap.push(row);
    }

    return bitmap;
  };

  // テキストをドット絵に変換してグリッドに反映
  const handleConvertText = async () => {
    if (textInput.length === 0) return;

    // フォントの読み込みを待つ
    try {
      await document.fonts.load('8px Misaki');
    } catch (error) {
      console.warn('フォントの読み込みに失敗しました:', error);
    }

    // 各文字を8x8ビットマップに変換して縦に並べる
    const allBitmaps: number[][] = [];
    for (let i = 0; i < textInput.length; i++) {
      const char = textInput[i];
      const bitmap = convertCharToBitmap(char);
      // ビットマップの各行を結果に追加
      allBitmaps.push(...bitmap);
    }

    // グリッドサイズを設定：幅8、高さは文字数 x 8
    setGridSizeW(8);
    setGridSizeH(textInput.length * 8);

    // useEffectの実行後にグリッドを更新するため、setTimeoutを使用
    setTimeout(() => {
      setGrid(allBitmaps);
    }, 0);
  };

  const generateResultText = () => {
    const command = grid
      .map(
        (row) =>
          `curl 'https://live-api.sohosai.com/channel/uni' -X POST -H 'User-Agent: Dot-Generator made by n4mlz' --data-raw '{"emojis":${JSON.stringify(row)}}'`
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
  }, [grid]);

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
                グリッドの高さ:
                <input
                  type="number"
                  min="1"
                  value={gridSizeH}
                  onChange={(event) => setGridSizeH(Number(event.target.value))}
                />
              </label>
            </div>
            <div className="text-converter">
              <label>
                みさきフォント変換:
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="テキスト入力"
                />
              </label>
              <button onClick={handleConvertText}>変換</button>
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
