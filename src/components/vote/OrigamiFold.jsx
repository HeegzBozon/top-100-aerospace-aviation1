// Faceted paper models keep the beak, wings and hull readable between folds.
export default function OrigamiFold() {
  return (
    <div className="env-fold" aria-hidden="true">
      <svg viewBox="0 0 300 200" className="env-origami">
        <g className="env-model env-model-plane">
          <path className="env-paper" d="M18 33 286 84 88 170 110 104Z" />
          <path className="env-paper-shade" d="m18 33 92 71 176-20-151 42-47 44 22-66Z" />
          <path className="env-paper-light" d="M18 33 135 126 286 84 110 104Z" />
          <path className="env-crease" d="m18 33 117 93 151-42M110 104l25 22-47 44" />
        </g>
        <g className="env-model env-model-crane">
          <path className="env-paper-shade" d="m137 133 83-113-20 104-47 32Z" />
          <path className="env-paper" d="m141 133-43-31-20-59-24-12-26 24 31-9 8 9 13 66 48 37 27-2 43-26 78-56-107 48Z" />
          <path className="env-paper-light" d="M139 137 32 27 76 129 128 158Z" />
          <path className="env-paper-shade" d="m128 158 11-21 30-15-14 34Z" />
          <path className="env-crease" d="m32 27 107 110-11 21m11-21 81-117-51 102 107-48M80 121l18-19-20-59-19 3" />
        </g>
        <g className="env-model env-model-boat">
          <path className="env-paper" d="m150 24-65 105h130Z" />
          <path className="env-paper-shade" d="m150 24 65 105h-65Z" />
          <path className="env-paper-light" d="m25 119 125 20 125-20-43 58H68Z" />
          <path className="env-paper-shade" d="m150 139 125-20-43 58h-82Z" />
          <path className="env-crease" d="M150 24v115L25 119m125 20 125-20m-125 20v38M85 129l65-17 65 17" />
        </g>
        <g className="env-model env-model-star">
          <path className="env-paper" d="m150 12 25 58 63 6-47 43 14 63-55-33-55 33 14-63-47-43 63-6Z" />
          <path className="env-paper-shade" d="m150 100 25-30-25-58Zm0 0 88-24-47 43Zm0 0 55 82-55-33Zm0 0-55 82 14-63Zm0 0L62 76l63-6Z" />
          <path className="env-crease" d="M150 12v88l88-24m-88 24 55 82m-55-82-55 82m55-82L62 76" />
        </g>
        <g className="env-model env-model-sheet">
          <path className="env-paper" d="M1 1h298v198H1Z" />
          <path className="env-crease" d="m1 1 149 110L299 1M1 199l114-85m184 85-114-85" />
        </g>
      </svg>
    </div>
  );
}