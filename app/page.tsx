"use client";

import React, { useEffect } from "react";
import { Input, Button, ButtonGroup, Form } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function App() {
  const [errors, setErrors] = React.useState({});
  const [inputs, setInputs] = React.useState([{ name: "" }]);
  const router = useRouter();
  const [currentLink, setCurrentLink] = React.useState("");

  const [_18holes, set18holes] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoading2, setIsLoading2] = React.useState(false);

  useEffect(() => {
    if (localStorage.getItem("currentLink") !== null) {
      setCurrentLink(localStorage.getItem("currentLink")!);
    }
  }, []);

  const onSubmit = (e: any) => {
    e.preventDefault();

    setIsLoading(true);

    const players = inputs
      .filter((input) => input.name)
      .map((input) => input.name);

    const query = new URLSearchParams({
      players: JSON.stringify(players),
      is18Holes: _18holes.toString(),
    }).toString();

    localStorage.removeItem("scores");
    localStorage.removeItem("pars");
    localStorage.removeItem("currentLink");

    router.push(`/partie?${query}`);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];

    newInputs[index].name = value;
    setInputs(newInputs);

    if (!value) {
      setInputs(
        inputs.filter(
          (input, i) => input.name !== "" || i === inputs.length - 1,
        ),
      );
    }

    if (index === inputs.length - 1 && index < 3 && value) {
      setInputs([...inputs, { name: "" }]);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Form
        className="w-full max-w-sm flex flex-col gap-3"
        validationErrors={errors}
        onSubmit={onSubmit}
      >
        {currentLink && (
          <>
            <label className="text-sm" htmlFor="nombre-de-trous">
              Partie en cours détectée, voulez-vous la reprendre ?
            </label>
            <Button
              fullWidth
              color="primary"
              isLoading={isLoading2}
              type="button"
              variant="flat"
              onPress={() => {
                setIsLoading2(true);
                router.push(currentLink);
              }}
            >
              Reprendre la partie en cours
            </Button>
          </>
        )}

        <div className="flex flex-col gap-3 w-full">
          <label className="text-sm" htmlFor="nombre-de-trous">
            Nombre de trous
          </label>
          <ButtonGroup fullWidth>
            <Button
              className="w-1/2"
              color={_18holes ? "default" : "success"}
              variant="flat"
              onPress={() => set18holes(false)}
            >
              9
            </Button>
            <Button
              className="w-1/2"
              color={_18holes ? "success" : "default"}
              variant="flat"
              onPress={() => set18holes(true)}
            >
              18
            </Button>
          </ButtonGroup>
        </div>
        <label className="text-sm" htmlFor="Joueurs">
          Joueurs (3-4)
        </label>

        {inputs.map((input, index) => (
          <Input
            key={index}
            className="text-base"
            labelPlacement="outside"
            name={`joueur${index + 1}`}
            size="md"
            placeholder={
              index < 3
                ? "+ Ajouter un joueur"
                : "+ Ajouter un joueur (optionnel)"
            }
            value={input.name}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        ))}

        <Button
          fullWidth
          color={inputs.length < 4 ? "default" : "success"}
          isDisabled={inputs.length < 4}
          isLoading={isLoading}
          type="submit"
          variant="flat"
        >
          Démarrer une nouvelle partie
        </Button>
      </Form>
    </div>
  );
}
