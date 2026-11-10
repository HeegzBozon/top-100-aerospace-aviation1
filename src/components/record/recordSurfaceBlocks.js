// A surface of the record is read in blocks. The checklist of lines is the first block;
// the editors that write those lines are the rest of it.
//
// Only the three long surfaces are cut: Credentials, the Interview and Availability each
// carry a full checklist and then their editors under it, and a block at a time is what
// makes them walkable. Every other surface is short enough to read straight down, so it
// declares nothing here and keeps the plain stacked reading it has always had.
export const SURFACE_BLOCKS = {
  credentials: [
    { key: 'lines', label: "The card's lines" },
    { key: 'printings', label: 'Printings', editor: true },
  ],
  interview: [
    { key: 'lines', label: 'The lines' },
    { key: 'dossier', label: 'The profile', editor: true },
    { key: 'portfolio', label: 'Portfolio' },
  ],
  availability: [
    { key: 'lines', label: 'The lines' },
    { key: 'doors', label: 'The doors', editor: true },
  ],
};

export const surfaceBlocks = (key) => SURFACE_BLOCKS[key] || null;

// Where a checklist line's "Add it" goes: the first editor the surface holds.
export const editorBlock = (key) =>
  (surfaceBlocks(key) || []).find((block) => block.editor) || null;