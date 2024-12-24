import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button, ButtonGroup } from "@nextui-org/button";
import React, { useEffect, useState } from "react";

interface ScoreboardProps {
  players: string[];
  is18Holes: boolean;
}

interface ScoreCellProps {
  value: number;
  defaultValue: number;
  isActive: boolean;
  rowIndex: number;
  playerIndex: number;
  updateScore: (row: number, player: number, score: number) => void;
}

interface ParCellProps {
  par: number;
  rowIndex: number;
  updatePar: (row: number, par: number) => void;
  nbPlayers: number;
  scores: number[][];
}

const MAX_VALUE = 10;
const MIN_VALUE = 1;

function formatScore(value: number, defaultValue: number) {
  if (value === -1) {
    return "-";
  }

  if (value === MAX_VALUE) {
    return "X";
  }

  if (value === MIN_VALUE) {
    return MIN_VALUE.toString();
  }

  return value.toString();
}

function ScoreCell({
  value,
  defaultValue,
  isActive,
  rowIndex,
  playerIndex,
  updateScore,
}: ScoreCellProps) {
  const [init, setInit] = useState(true);

  function modifyScore(inc: boolean) {
    if (init) {
      updateScore(rowIndex, playerIndex, defaultValue);
      setInit(false);

      return;
    }

    const newValue = value + (inc ? 1 : -1);

    updateScore(rowIndex, playerIndex, newValue);
    setInit(false);
  }

  return (
    <Popover placement="top">
      <PopoverTrigger className="w-3 min-w-0 rounded-md">
        <Button isDisabled={!isActive} style={{ fontStyle: "monospace" }}>
          {formatScore(value, defaultValue)}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <ButtonGroup>
            <Button
              className="text-lg"
              size="sm"
              onPress={() => value !== MIN_VALUE && modifyScore(false)}
            >
              -
            </Button>
            <Button
              className="text-lg"
              size="sm"
              onPress={() => value !== MAX_VALUE && modifyScore(true)}
            >
              +
            </Button>
          </ButtonGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ParCell({
  par,
  rowIndex,
  updatePar,
  nbPlayers,
  scores,
}: ParCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover isOpen={isOpen} placement="top" onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          className="bg-primary w-3 min-w-0 rounded-md text-white"
          style={{ fontStyle: "monospace" }}
        >
          {par === -1 ? "-" : par}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <ButtonGroup>
            {[3, 4, 5].map((newPar) => (
              <Button
                key={newPar}
                className="text-lg"
                size="sm"
                onPress={() => {
                  updatePar(rowIndex, newPar);
                  setIsOpen(false);
                }}
              >
                {newPar}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RowContent(
  rowIndex: number,
  players: string[],
  scores: number[][],
  updateScore: (row: number, player: number, score: number) => void,
  par: number,
  updatePar: (row: number, par: number) => void,
) {
  const areScoresActive = par !== -1;

  return (
    <div key={rowIndex} className="flex flex-row items-center">
      <div className="w-16 px-2 py-1 text-center">{rowIndex + 1}</div>
      <div className="w-12 px-2 py-1 text-center">
        <ParCell
          nbPlayers={players.length}
          par={par}
          rowIndex={rowIndex}
          scores={scores}
          updatePar={updatePar}
        />
      </div>
      {players.map((_, playerIndex) => (
        <div key={playerIndex} className="flex-1 px-2 py-1 text-center">
          <ScoreCell
            defaultValue={par}
            isActive={areScoresActive}
            playerIndex={playerIndex}
            rowIndex={rowIndex}
            updateScore={updateScore}
            value={scores[rowIndex][playerIndex]}
          />
        </div>
      ))}
      <div className="w-16 px-2 py-1 text-center">
        {scores[rowIndex].some((score) => score < 0)
          ? "-"
          : scores[rowIndex].reduce((a, b) => a + b, 0)}
      </div>
    </div>
  );
}

export default function Scoreboard({ players, is18Holes }: ScoreboardProps) {
  const nbRows = is18Holes ? 18 : 9;

  // Load saved scores and pars from localStorage (if available)
  const loadSavedState = () => {
    const savedScores = localStorage.getItem("scores");
    const savedPars = localStorage.getItem("pars");

    if (savedScores && savedPars) {
      return {
        scores: JSON.parse(savedScores),
        pars: JSON.parse(savedPars),
      };
    }

    return {
      scores: Array.from({ length: nbRows }, () =>
        Array(players.length).fill(-1),
      ),
      pars: Array(nbRows).fill(-1),
    };
  };

  // Retrieve initial state
  const { scores: initialScores, pars: initialPars } = loadSavedState();

  const [scores, setScores] = useState<number[][]>(initialScores);
  const [pars, setPars] = useState<number[]>(initialPars);

  // Save scores and pars to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
    localStorage.setItem("pars", JSON.stringify(pars));
  }, [scores, pars]);

  useEffect(() => {
    const currentLink = window.location.href;

    localStorage.setItem("currentLink", currentLink);
  }, []);

  const setScore = (row: number, player: number, score: number) => {
    setScores((prev) => {
      const updated = [...prev];

      updated[row] = [...prev[row]];
      updated[row][player] = score;

      return updated;
    });
  };

  const updatePar = (row: number, par: number) => {
    setPars((prev) => {
      const updated = [...prev];

      updated[row] = par;

      return updated;
    });
  };

  function computeScore(player: number) {
    let total = 0;

    for (let i = nbRows - 1; i >= 0; i--) {
      if (scores[i][player] == -1) continue;

      total += scores[i][player] - pars[i];
    }

    return total;
  }

  function formatScore(score: number) {
    if (score > 0) {
      return `+${score}`;
    }

    return score;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row bg-default rounded-md mb-1 font-bold">
        <div className="w-16 px-2 py-1 text-center">Trou</div>
        <div className="w-12 px-2 py-1 text-center">Par</div>
        {players.map((player, index) => (
          <div key={index} className="flex-1 px-2 py-1 text-center">
            {`${player.charAt(0)}.`}
          </div>
        ))}
        <div className="w-16 px-2 py-1 text-center">Score</div>
      </div>

      <div className="flex flex-col">
        {Array.from({ length: nbRows }, (_, rowIndex) =>
          RowContent(
            rowIndex,
            players,
            scores,
            setScore,
            pars[rowIndex],
            updatePar,
          ),
        )}
      </div>
      <div className="flex flex-row bg-default rounded-md mt-1 font-bold">
        <div className="w-16 px-2 py-1 text-center" />
        <div
          className="w-12 px-2 py-1 text-center text-md"
          style={{ fontFamily: "monospace" }}
        >
          {pars.reduce((a, b) => (b !== -1 ? a + b : a), 0)}
        </div>
        {players.map((player, index) => (
          <div
            key={index}
            className="flex-1 px-2 py-1 text-center text-md"
            style={{ fontFamily: "monospace" }}
          >
            {formatScore(computeScore(index))}
          </div>
        ))}
        <div className="w-16 px-2 py-1 text-center" />
      </div>
    </div>
  );
}
