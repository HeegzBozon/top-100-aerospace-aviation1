import { useEffect } from "react";
import { createPageUrl } from "@/utils";

// Articles page has been sunset. Content now lives in #general channel in Comms.
export default function Articles() {
  useEffect(() => {
    window.location.replace(createPageUrl("Comms"));
  }, []);
  return null;
}