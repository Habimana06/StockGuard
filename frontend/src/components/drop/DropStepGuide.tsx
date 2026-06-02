const steps = [
  {
    n: "1",
    title: "Reserve",
    text: "Tap Reserve — we lock one unit under your name instantly.",
  },
  {
    n: "2",
    title: "5-minute window",
    text: "A countdown starts. Complete checkout before it hits zero.",
  },
  {
    n: "3",
    title: "Miss the timer?",
    text: "Your hold expires automatically and stock returns for everyone else.",
  },
];

export function DropStepGuide() {
  return (
    <aside className="drop-guide" aria-label="How the drop works">
      <h2 className="drop-guide__heading">How this drop works</h2>
      <ol className="drop-guide__list">
        {steps.map((s) => (
          <li key={s.n} className="drop-guide__item">
            <span className="drop-guide__num">{s.n}</span>
            <div>
              <p className="drop-guide__title">{s.title}</p>
              <p className="drop-guide__text">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <ul className="drop-guide__trust">
        <li>Real-time stock every 5s</li>
        <li>No overselling — ever</li>
        <li>One active reservation per customer</li>
      </ul>
    </aside>
  );
}
