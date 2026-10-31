import { ShoppingBag, Store } from "lucide-react";

// The Chamber of Commerce: the house's trading floor, and the two counters open on it.
//
// They were separate keys once — the shelf of micro-tools and the shop — and they read
// as two errands on a menu that only has room for programs. Under one roof they are what
// they actually are: the place a Fellow goes to take something away, either a tool cut
// from their own record or an object printed with the house's mark.
export const CHAMBER_PROGRAMS = [
  {
    key: "app-store",
    index: "1",
    label: "App Store",
    blurb: "The shelf of micro-tools, each doing one job on your own record and handing back an artifact.",
    to: "/app-store",
    icon: Store,
  },
  {
    key: "gift-shop",
    index: "2",
    label: "Gift Shop",
    blurb: "The house's own objects — the flagship, the collection, and the drops as they open.",
    to: "/gift-shop",
    icon: ShoppingBag,
  },
];