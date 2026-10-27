import { BOARD_COLUMNS } from "@/components/board/boardConfig";
import SwitchBank from "./SwitchBank";

// The display bank: one switch per direction on the board. Throwing one takes the
// display to that column, which is the panel's own way of walking the four
// directions across without scrolling for them.
export default function DisplayBank({ active, onPick }) {
  const items = BOARD_COLUMNS.map((column) => ({
    key: column.label,
    label: column.label,
    on: active === column.label,
  }));

  return <SwitchBank items={items} onThrow={onPick} />;
}