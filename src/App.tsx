import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";

function App() {
  const [cellsPerRow, setCellsPerRow] = useState(35);
  const [cellsPerColumn, setCellsPerColumn] = useState(20);
  const [delay, setDelay] = useState(100);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [running, setRunning] = useState(false);

  const handleReset = () => {
    invoke("reset_grid", {
      cellsPerRow: cellsPerRow,
      cellsPerColumn: cellsPerColumn,
    }).then((grid) => {
      setGrid(grid as boolean[][]);
      setRunning(false);
    });
  };

  useEffect(() => {
    handleReset();
  }, []);

  useEffect(() => {
    // Game Tick
    const interval = setInterval(() => {
      if (!running) return;
      invoke("tick", {
        grid,
      }).then((grid) => {
        setGrid(grid as boolean[][]);
      });
    }, delay);

    return () => {
      clearInterval(interval);
    };
  }, [grid, delay, running]);

  return (
    <div className="App">
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`cell ${cell ? "alive" : "dead"}`}
                onClick={() => {
                  invoke("set_cell", {
                    grid,
                    row: rowIndex,
                    column: cellIndex,
                    value: !cell,
                  }).then((grid) => {
                    setGrid(grid as boolean[][]);
                  });
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="controls">
        <div className="control">
          <label>rows:</label>
          <input
            type="number"
            value={cellsPerRow}
            onChange={(e) => setCellsPerRow(Number(e.target.value))}
          />
        </div>
        <div className="control">
          <label>columns:</label>
          <input
            type="number"
            value={cellsPerColumn}
            onChange={(e) => setCellsPerColumn(Number(e.target.value))}
          />
        </div>

        <div className="control">
          <button onClick={handleReset}>Reset</button>
        </div>

        <div className="control">
          <button
            onClick={() =>
              invoke("randomize", {
                cellsPerRow: cellsPerRow,
                cellsPerColumn: cellsPerColumn,
              }).then((grid) => {
                setGrid(grid as boolean[][]);
              })
            }
          >
            Randomize
          </button>
        </div>
      </div>

      <div className="controls">
        <div className="control">
          <label>Delay:</label>
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
          />
        </div>

        <div className="control">
          <button onClick={() => setRunning(!running)}>
            {running ? "Stop" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
