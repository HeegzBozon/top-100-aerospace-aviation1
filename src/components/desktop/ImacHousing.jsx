import { useEffect } from "react";
import ImacCrown from "./ImacCrown";
import ImacChin from "./ImacChin";
import ImacRoom from "./ImacRoom";
import useImacFinish from "./useImacFinish";
import "./imac.css";

// The machine itself: the moulding, the tube, the glass over it and the chin.
//
// Whoever paints it puts the desk on the document and wears the Fellow's colour,
// so the shell and the loading chassis are literally the same machine — a surface
// never arrives in a different computer than the one it left.
export default function ImacHousing({ children }) {
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
      >
        {children}
      </div>

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