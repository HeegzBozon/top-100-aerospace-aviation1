import { useEffect } from "react";
import ImacCrown from "./ImacCrown";
import ImacChin from "./ImacChin";
import ImacRoom from "./ImacRoom";
import DesktopMenuBar from "./DesktopMenuBar";
import useImacFinish from "./useImacFinish";
import "./imac.css";

// The machine itself: the moulding, the tube, the glass over it and the chin.
//
// Whoever paints it puts the desk on the document and wears the Fellow's colour,
// so the shell and the loading chassis are literally the same machine — a surface
// never arrives in a different computer than the one it left.
//
// The menubar stands at the head of the tube, holding its place while the surface
// beneath it scrolls under — the same strip the handheld wears, so the desk and the
// glass hold one menu between them.
export default function ImacHousing({ children, shelf = null }) {
  const { finishKey, finish, pack, packs, options, chooseFinish, choosePack } = useImacFinish();

  useEffect(() => {
    document.body.classList.add("imac-shell");
    return () => document.body.classList.remove("imac-shell");
  }, []);

  return (
    <>
    {/* The room the machine stands in: wall, light and desk, cut from the pack the
        moulding is in. Painted first, so the machine sits in it rather than on it. */}
    <ImacRoom pack={pack} />

    <div className="imac-machine">
      <ImacCrown />

      {/* The one opening the whole platform is seen through. It carries focus so
          the tube itself can be scrolled from the keyboard; the wheel and the
          trackpad scroll it without asking. */}
      <div
        className="imac-screen scrollbar-hide"
        tabIndex={0}
        role="region"
        aria-label="Machine screen"
        data-desk-tube=""
      >
        <DesktopMenuBar />
        {children}
      </div>

      {/* The shelf stands on the picture: it is seated against the foot of the tube's
          own opening, measured from the machine rather than from the window, so it can
          never drift out past the resin on any screen height. It sits outside the
          scrolling window, so the record's pages pass under it and it stays put. */}
      {shelf ? <div className="imac-shelf">{shelf}</div> : null}

      <div className="imac-glass" aria-hidden="true" />
      <ImacChin
        finish={finish}
        pack={pack}
        packs={packs}
        options={options}
        finishKey={finishKey}
        onChoose={chooseFinish}
        onChoosePack={choosePack}
      />
    </div>
    </>
  );
}