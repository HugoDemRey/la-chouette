"use client";

import React from "react";
import { Input } from "@nextui-org/input";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Form } from "@nextui-org/form";
import { useRouter } from "next/navigation";

export default function App() {
  const [errors, setErrors] = React.useState({});
  const [inputs, setInputs] = React.useState([{ name: "" }]);
  const router = useRouter();

  const [_18holes, set18holes] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);

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

    if (index === inputs.length - 1 && value) {
      setInputs([...inputs, { name: "" }]);
    }
  };

  return (
    <Form
      className="w-full max-w-xs flex flex-col gap-3"
      validationErrors={errors}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-3 w-full">
        <label className="text-sm" htmlFor="nombre-de-trous">
          Nombre de trous
        </label>
        <ButtonGroup fullWidth>
          <Button
            className="w-1/2"
            color={_18holes ? "default" : "success"}
            variant="flat"
            onClick={() => set18holes(false)}
            onFocus={() => set18holes(false)}
          >
            9
          </Button>
          <Button
            className="w-1/2"
            color={_18holes ? "success" : "default"}
            variant="flat"
            onClick={() => set18holes(true)}
            onFocus={() => set18holes(true)}
          >
            18
          </Button>
        </ButtonGroup>
      </div>

      {inputs.map((input, index) => (
        <Input
          key={index}
          label={
            index === inputs.length - 1
              ? `Joueur ${index + 1} (nouveau)`
              : `Joueur ${index + 1}`
          }
          labelPlacement="outside"
          name={`joueur${index + 1}`}
          placeholder="+ Ajouter un joueur"
          value={input.name}
          onChange={(e) => handleInputChange(index, e.target.value)}
        />
      ))}

      <Button
        fullWidth
        color={inputs.length == 1 ? "default" : "success"}
        isDisabled={inputs.length == 1}
        isLoading={isLoading}
        type="submit"
        variant="flat"
      >
        Démarrer la partie
      </Button>
    </Form>
  );
}
