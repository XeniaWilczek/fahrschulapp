export default function Rules() {
  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 flex flex-col justify-center items-center gap-2 px-6">
      <h1 className="text-2xl font-bold">Spielregeln</h1>
      <div className="w-[60vw] flex flex-col justify-center items-center gap-2">
        <p>1. Eine Spielrunde besteht aus 5 Verkehsszenarien.</p>
        <p>
          2. Das Auto fährt von alleine und stoppt an einer kniffligen
          Verkehrssituation.
        </p>
        <p>
          3. An dieser Stelle bist du gefragt! Wähle die richtige Antwort auf
          eine Frage aus drei Antwortmöglichkeiten aus.
        </p>
        <p>
          4. Punkte-Regel: Einen Punkt gibt es nur, wenn du direkt die richtige
          Antwort wählst.
        </p>
        <p>
          5. Klicke nach der Auflösung auf "Weiter", um das nächste Szenario zu
          starten.
        </p>
        <p>
          6. Unter der Ansicht "Spiel erweitern" kannst du außerdem weitere
          Verkehrsszenarien hinzufügen.
        </p>
      </div>
    </div>
  );
}
