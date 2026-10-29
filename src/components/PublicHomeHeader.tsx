import { createPortal } from "react-dom";
import Header from "./Header";

/** Keep header → hero → content DOM order when home has an initial HTML island. */
export default function PublicHomeHeader() {
  const slot = typeof document === "undefined" ? null : document.getElementById("public-header-root");
  return slot ? createPortal(<Header />, slot) : <Header />;
}
