const steps = [
  { n: "1", title: "Reserve", text: "Lock one unit — stock is held only for you" },
  { n: "2", title: "Checkout", text: "You have 5 minutes to complete payment" },
  { n: "3", title: "Miss the window?", text: "Hold expires and stock returns for everyone" },
];

export function DropStepGuide() {
  return (
    <aside className="drop-guide" aria-label="How the drop works">
      <h2 className="drop-guide__heading">How it works</h2>
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
    </aside>
  );
}
