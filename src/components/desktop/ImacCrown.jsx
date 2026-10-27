// The band above the tube: the grip moulded into the crown, and the speaker
// grilles punched either side of it. Nothing here is a control — it is the top of
// the machine, so the picture below it starts as high as the hardware allows.
export default function ImacCrown() {
  return (
    <div className="imac-crown imac-band px-7">
      <span className="imac-grille h-[18px] w-[86px]" aria-hidden="true" />
      <div className="imac-grip" aria-hidden="true" />
      <span className="imac-grille h-[18px] w-[86px]" aria-hidden="true" />
    </div>
  );
}