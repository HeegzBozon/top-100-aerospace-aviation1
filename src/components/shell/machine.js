// The machine has a name.
//
// Everything this app draws is drawn by one machine: a desk in its tube, a handheld
// with a ring, a chin and a radio face, and the glass they all show the same picture
// through. The code has always said "the machine" in its comments — this keeps that
// name in one place, so a surface can say which face it is standing on and the whole
// layer can be referred to in a word rather than a list of hardware.
//
//   MACHINE    the layer — the shells, the furniture, the keys and the ring
//   the desk   its wide face        (Flight Deck; fd-* / imac-*)
//   the glass  its handheld picture (the pane; hh-*)
//   the ring   the one control every face carries
//
// A surface names it in small caps at the head of a sheet, the way a printed
// instrument carries its maker: MACHINE · DIRECTORY.
export const MACHINE_NAME = 'MACHINE';

// The overline a sheet carries: the maker, then the surface's own name.
export const machineOverline = (surface) =>
  surface ? `${MACHINE_NAME} · ${surface}` : MACHINE_NAME;