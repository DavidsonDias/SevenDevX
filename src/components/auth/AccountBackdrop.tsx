import "./account-experience.css";

/** Decorative depth without WebGL, network assets or continuous animation. */
export function AccountBackdrop() {
  return <div className="account-backdrop" aria-hidden="true">
    <div className="account-grid" />
    <div className="account-orbit account-orbit-one" />
    <div className="account-orbit account-orbit-two" />
    <div className="account-beacon"><span>{"</>"}</span></div>
  </div>;
}
