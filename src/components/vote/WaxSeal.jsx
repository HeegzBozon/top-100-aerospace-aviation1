// The seal on the flap: one struck disc of gold wax, with the house mark sunk into it
// — a rocket inside a thin ring. Whole, as a seal is; it lifts off in one piece.
export default function WaxSeal() {
  return (
    <div className="env-seal" aria-hidden="true">
      <svg className="env-seal-mark" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="env-seal-ring" cx="12" cy="12" r="9.1" />
        <path
          className="env-seal-body"
          d="M12 3.2c2.2 1.9 3.5 4.7 3.5 7.7v3.1l1.5 1.9c.2.3.3.6.3 1v2.4l-2.4-1.3a6.2 6.2 0 0 1-5.8 0l-2.4 1.3v-2.4c0-.4.1-.7.3-1l1.5-1.9v-3.1c0-3 1.3-5.8 3.5-7.7Z"
        />
        <circle className="env-seal-window" cx="12" cy="9.6" r="1.3" />
      </svg>
    </div>
  );
}