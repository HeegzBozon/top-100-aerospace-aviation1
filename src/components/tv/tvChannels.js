// THE CHANNELS THIS TELEVISION RECEIVES.
//
// A channel is one slot on the dial and one way of filling the screen. The registry below
// is the whole programme: a station is added here and nowhere else — the guide, the screen
// and the console all read this list, which is how the set is meant to grow past what it
// carries today.
//
//   number    the figure printed on the dial. Numbers are never reused, the guide reads in
//             dial order, and the radio's keypad tunes by them.
//   name      what the station is called on the guide and the marquee.
//   strap     the line under the mark: what the channel is, in a breath.
//   kind      how it fills the screen —
//               'youtube'  a channel's own latest uploads, read through the Data API
//               'live'     a station the surface draws itself (the house news room)
//               'reserved' a slot standing empty on purpose
//   handle    for 'youtube', the channel's own handle. One line to change if the house
//             ever opens a second set of airwaves.
export const TV_CHANNELS = [
  {
    key: "house",
    number: 1,
    name: "TOP 100 TV",
    strap: "The house's own channel",
    kind: "youtube",
    // The house's own channel. The id is carried with the handle so the set tunes to the
    // same airwaves even if the handle is ever rewritten on YouTube.
    handle: "top100aerospaceaviation",
    channelId: "UCit8v3ilmfs67G46Me0Txrg",
    dial: "Latest uploads",
  },
  {
    key: "newsroom",
    number: 2,
    name: "The Newsroom",
    strap: "World news, live",
    kind: "live",
    dial: "On air",
  },
  {
    key: "three",
    number: 3,
    name: "Channel Three",
    strap: "Not yet on the air",
    kind: "reserved",
    dial: "Reserved",
    note:
      "The third slot is held open. When the house has a second strand of its own to air — the season's sessions, the conference floor, the interviews behind an edition — it takes this number.",
  },
];

export const channelByNumber = (number) =>
  TV_CHANNELS.find((channel) => channel.number === Number(number)) || TV_CHANNELS[0];

// The figure as the dial prints it: 01, 02, 03.
export const dialNumber = (number) => String(number).padStart(2, "0");