"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  ButtonGroup,
} from "@heroui/react";
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
  tick: number;
  updateScore: (row: number, player: number, score: number) => void;
}

interface ParCellProps {
  par: number;
  rowIndex: number;
  updatePar: (row: number, par: number) => void;
}

const MAX_VALUE = 10;
const MIN_VALUE = 1;

const TableDimensions = {
  ThreePlayers: {
    HOLE_WIDTH: "w-16",
    PAR_WIDTH: "w-20",
    SCORE_WIDTH: "w-16",
  },
  FourPlayers: {
    HOLE_WIDTH: "w-16",
    PAR_WIDTH: "w-14",
    SCORE_WIDTH: "w-14",
  },
};



function formatScore(value: number) {
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
  tick,
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
        <Button isDisabled={!isActive} style={{ fontStyle: "monospace", paddingInline: "1.5rem" }}>
          <span className="absolute top-0 right-1 text-l font-bold">
            {formatScore(value)}
          </span>
          <span className="absolute left-3 text-xl font-bold">{tick === -1 ? "-" : tick}</span>
          
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <ButtonGroup>
            <Button
              className="text-xl"
              size="sm"
              onPress={() => value !== MIN_VALUE && modifyScore(false)}
            >
              -
            </Button>
            <span className="px-2 text-xl">{formatScore(value)}</span>
            <Button
              className="text-xl"
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

function ParCell({ par, rowIndex, updatePar }: ParCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover isOpen={isOpen} placement="top" onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <Button
          className="bg-primary w-3 min-w-0 rounded-md text-white text-xl font-bold px-5"
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
                className="text-l"
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
  ticks: number[],
  par: number,
  updatePar: (row: number, par: number) => void,
) {
  const areScoresActive = par !== -1;

  return (
    <div
      key={rowIndex}
      className={`flex flex-row items-center ${rowIndex % 2 === 1 ? "bg-default-50" : ""} rounded-md`}
    >
      <div className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].HOLE_WIDTH} px-2 py-1 text-center text-sm`}>
        {rowIndex + 1}
      </div>
      <div className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].PAR_WIDTH} w-14 px-2 py-1 text-center`}>
        <ParCell par={par} rowIndex={rowIndex} updatePar={updatePar} />
      </div>
      {players.map((_, playerIndex) => (
        <div key={playerIndex} className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].SCORE_WIDTH} w-14 flex-1 px-2 py-1 text-center`}>
          <ScoreCell
            defaultValue={par}
            isActive={areScoresActive}
            playerIndex={playerIndex}
            rowIndex={rowIndex}
            tick={ticks[playerIndex]}
            updateScore={updateScore}
            value={scores[rowIndex][playerIndex]}
          />
        </div>
      ))}
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

  // the ticks are placed on top of each scorecell to indicate the points of the "La Chouette" game
  const [ticks, setTicks] = useState<number[][]>(
    Array.from({ length: nbRows }, () => Array(players.length).fill(-1)),
  );

  const [ticksSum, setTicksSum] = useState<number[]>(
    Array(players.length).fill(0),
  );

  // Save scores and pars to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("scores", JSON.stringify(scores));
    localStorage.setItem("pars", JSON.stringify(pars));
  }, [scores, pars]);

  useEffect(() => {
    updateTicks();
  }, [scores]);

  useEffect(() => {
    updateTicksSum();
  }, [ticks]);

  useEffect(() => {
    const currentLink = window.location.href;

    localStorage.setItem("currentLink", currentLink);
  }, []);

  function updateRowTicksFor3Players(
    row: number,
    updated: number[][],
    prev: number[][],
  ) {
    updated[row] = [...prev[row]];

    const s: number[] = [scores[row][0], scores[row][1], scores[row][2]];

    const isOneNegative = s.some((score) => score < 0);

    if (isOneNegative) return;

    const areThreeEqual: boolean = s.every((score) => score === s[0]);

    if (areThreeEqual) {
      updated[row][0] = 2;
      updated[row][1] = 2;
      updated[row][2] = 2;

      return;
    }

    const bestIndex: number = s.indexOf(Math.min(...s));
    const worstIndex: number = s.indexOf(Math.max(...s));
    const middleIndex: number = [0, 1, 2].filter(
      (index) => index !== bestIndex && index !== worstIndex,
    )[0];

    const twoBestEqual: boolean = s[bestIndex] === s[middleIndex];

    if (twoBestEqual) {
      updated[row][bestIndex] = 3;
      updated[row][middleIndex] = 3;
      updated[row][worstIndex] = 0;

      return;
    }

    const twoWorstEqual: boolean = s[worstIndex] === s[middleIndex];

    if (twoWorstEqual) {
      updated[row][bestIndex] = 4;
      updated[row][middleIndex] = 1;
      updated[row][worstIndex] = 1;

      return;
    }

    updated[row][bestIndex] = 4;
    updated[row][middleIndex] = 2;
    updated[row][worstIndex] = 0;
  }

  function updateRowTicksFor4Players(
    row: number,
    updated: number[][],
    prev: number[][],
  ) {
    updated[row] = [...prev[row]];

    const s: number[] = [
      scores[row][0],
      scores[row][1],
      scores[row][2],
      scores[row][3],
    ];

    const isOneNegative = s.some((score) => score < 0);

    if (isOneNegative) return;

    const areFourEqual: boolean = s.every((score) => score === s[0]);

    if (areFourEqual) {
      updated[row][0] = 3;
      updated[row][1] = 3;
      updated[row][2] = 3;
      updated[row][3] = 3;

      return;
    }

    const bestIndex: number = s.indexOf(Math.min(...s));
    const worstIndex: number = s.indexOf(Math.max(...s));
    const middleIndices: number[] = [0, 1, 2, 3]
      .filter((index) => index !== bestIndex && index !== worstIndex)
      .sort((a, b) => s[a] - s[b]);

    // middleIndices[0] >= middleIndices[1]
    const twoBestEqual: boolean = s[bestIndex] === s[middleIndices[0]];
    const twoWorstEqual: boolean = s[worstIndex] === s[middleIndices[1]];

    if (twoBestEqual) {
      if (twoWorstEqual) {
        updated[row][bestIndex] = 4;
        updated[row][middleIndices[0]] = 4;
        updated[row][middleIndices[1]] = 2;
        updated[row][worstIndex] = 2;

        return;
      }

      const threeBestEqual =
        updated[row][middleIndices[0]] === updated[row][middleIndices[1]];

      if (threeBestEqual) {
        updated[row][bestIndex] = 4;
        updated[row][middleIndices[0]] = 4;
        updated[row][middleIndices[1]] = 4;
        updated[row][worstIndex] = 0;

        return;
      }
    }

    if (twoWorstEqual) {
      const threeWorstEqual = s[middleIndices[0]] === s[middleIndices[1]];

      if (threeWorstEqual) {
        updated[row][bestIndex] = 6;
        updated[row][middleIndices[0]] = 2;
        updated[row][middleIndices[1]] = 2;
        updated[row][worstIndex] = 2;

        return;
      }

      updated[row][bestIndex] = 6;
      updated[row][middleIndices[0]] = 4;
      updated[row][middleIndices[1]] = 1;
      updated[row][worstIndex] = 1;

      return;
    }

    const twoMiddleEqual = s[middleIndices[0]] === s[middleIndices[1]];

    if (twoMiddleEqual) {
      updated[row][bestIndex] = 6;
      updated[row][middleIndices[0]] = 3;
      updated[row][middleIndices[1]] = 3;
      updated[row][worstIndex] = 0;

      return;
    }

    updated[row][bestIndex] = 6;
    updated[row][middleIndices[0]] = 3;
    updated[row][middleIndices[1]] = 2;
    updated[row][worstIndex] = 1;
  }

  function updateRowTicks(
    nbPlayers: number,
    updated: number[][],
    prev: number[][],
  ) {
    const fn: (row: number, updated: number[][], prev: number[][]) => void =
      nbPlayers === 3 ? updateRowTicksFor3Players : updateRowTicksFor4Players;

    for (let i = 0; i < nbRows; i++) fn(i, updated, prev);
  }

  function updateTicks() {
    setTicks((prev) => {
      // Hard copy of the previous ticks
      const updated = prev.map((row) => [...row]);

      updateRowTicks(players.length, updated, prev);

      return updated;
    });
  }

  function updateTicksSum() {
    setTicksSum((prev) => {
      const updated = Array(players.length).fill(0);

      for (let i = 0; i < players.length; i++) {
        for (let j = 0; j < nbRows; j++) {
          if (ticks[j][i] !== -1) {
            updated[i] += ticks[j][i];
          }
        }
      }

      const minValue = Math.min(...updated);

      for (let i = 0; i < updated.length; i++) {
        updated[i] -= minValue;
      }
      return updated;
    });
  }

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


  return (
    <div className="flex flex-col">
      <div className="flex flex-row border-b-2 border-default mb-1 font-semibold">
        <div className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].HOLE_WIDTH} px-2 py-1 text-center`}>Trou</div>
        <div className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].PAR_WIDTH} w-14 px-2 py-1 text-center`}>Par</div>
        {players.map((player, index) => (
          <div key={index} className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].SCORE_WIDTH} flex-1 px-2 py-1 text-center`}>
            {`${player.charAt(0)}.`}
          </div>
        ))}
      </div>

      <div className={"flex flex-col"}>
        {Array.from({ length: nbRows }, (_, rowIndex) =>
          RowContent(
            rowIndex,
            players,
            scores,
            setScore,
            ticks[rowIndex],
            pars[rowIndex],
            updatePar,
          ),
        )}
      </div>
      <div className={`flex flex-row border-t-2 border-default mt-1`}>
        <div className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].HOLE_WIDTH} px-2 py-1 text-center`} />
        <div className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].PAR_WIDTH} px-2 py-1 text-center text-md text-primary`}>
          {/* {pars.reduce((a, b) => (b !== -1 ? a + b : a), 0)} */}
        </div>
        {players.map((player, index) => (
          <div
            key={index}
            className={`${TableDimensions[players.length === 3 ? "ThreePlayers" : "FourPlayers"].SCORE_WIDTH} flex-1 px-2 py-1 text-center relative`}
          >
            <span className="text-md">{ticksSum[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
