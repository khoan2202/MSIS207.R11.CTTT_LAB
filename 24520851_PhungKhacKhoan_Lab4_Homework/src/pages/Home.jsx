import { Link } from "react-router";

export default function Home() {
  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title">Lab 4 — Homework</h1>
      <ul className="hw-list">
        <li className="card"><h2><Link to="/gallery">HW1 · Photo &amp; Evidence Gallery</Link></h2><p>Deep link bằng useSearchParams, lightbox bằng &lt;dialog&gt;.</p></li>
        <li className="card"><h2><Link to="/swipe">HW2 · Card-Swipe Deck</Link></h2><p>Bàn phím + pointer, undo LIFO, điểm derived, lưu Express + Mongoose 8.</p></li>
        <li className="card"><h2><Link to="/dossier">HW3 · Esports Fair-Play Appeal Tribunal</Link></h2><p>Dossier theo /dossier/:playerID, form khiếu nại Context, đồng hồ SLA không trôi.</p></li>
      </ul>
    </section>
  );
}
