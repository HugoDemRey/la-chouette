"use client";
import { Card, CardHeader, CardBody } from "@nextui-org/react";

export default function GolfRules() {
  return (
    <div className="flex justify-center items-center min-h-screen pb-8">
      <Card className="w-full max-w-3xl shadow-lg rounded-lg">
        <CardHeader className="bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-100 rounded-t-lg py-4 px-6">
          <h2 className="text-lg font-bold">
            Règles de La Chouette
          </h2>
        </CardHeader>
        <CardBody className="p-6 space-y-6">
          <p className="leading-relaxed">
            <strong>La Chouette</strong> est un jeu de golf pour 3
            joueurs où 6 points sont à partager à chaque trou. Voici les
            différents cas :
          </p>

          <div>
            <h3 className="text-lg font-semibold mb-2"> Calcul du Score</h3>
            <h3 className="underline">Cas 1 :</h3>
            <p className="leading-relaxed">
              Si le joueur A fait un &quot;par&quot; et que les joueurs B et C
              font un &quot;bogey&quot; :
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>
                A obtient <strong>4 points</strong>
              </li>
              <li>
                B et C obtiennent chacun <strong>1 point</strong>
              </li>
            </ul>
            <br />

            <h3 className="underline">Cas 2 :</h3>
            <p className="leading-relaxed">
              Si le joueur A fait un &quot;par&quot;, le joueur B fait un
              &quot;bogey&quot; et le joueur C fait un &quot;double bogey&quot;
              :
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>
                A obtient <strong>4 points</strong>
              </li>
              <li>
                B obtient <strong>2 points</strong>
              </li>
              <li>
                C obtient <strong>0 point</strong> (C ne marque pas)
              </li>
            </ul>
            <br />

            <h3 className="underline">Cas 3 :</h3>
            <p className="leading-relaxed">
              Si les joueurs A et B font un &quot;par&quot; et que le joueur C
              fait un &quot;bogey&quot; :
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>
                A et B partagent équitablement, obtenant{" "}
                <strong>3 points</strong> chacun
              </li>
              <li>
                C obtient <strong>0 point</strong>
              </li>
            </ul>
            <br />

            <h3 className="underline">Cas 4 :</h3>
            <p className="text-sm leading-relaxed">
              Si les joueurs A, B et C font tous un &quot;par&quot; :
            </p>
            <ul className="list-disc list-inside pl-4">
              <li>
                Chaque joueur obtient <strong>2 points</strong>
              </li>
            </ul>
          </div>
          <br />

          <div>
            <h3 className="text-lg font-semibold mb-2">Simplification du Score</h3>
            <p className="text-sm leading-relaxed">
              Pour simplifier les scores et éviter des résultats trop élevés au
              18<sup>e</sup> trou, les points sont réduits progressivement en soustrayant à chaque joueur le score de celui ayant le plus faible score.
            </p>
            <ul className="list-disc list-inside pl-4">
              <li> [12, 8, 4] -&gt; [8, 4, 0]</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Note :</h3>
            <p className="text-sm leading-relaxed">
              - À 4 joueurs, les points à partager doublent : il y aura 12
              points à distribuer par trou.
              <br />- Le score total reste toujours un multiple de 3.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
