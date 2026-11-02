import "./account-experience.css";
import symbol from "@/assets/brand-symbol.svg";

/** Original SevenDevX symbol, layered in CSS; no WebGL or pointer listeners. */
export function AccountBrand() {
  return <img className="account-brand-seal" src={symbol} alt="SevenDevX" width="64" height="46" />;
}

export function AccountBackdrop() {
  return <div className="account-backdrop" aria-hidden="true">
    <div className="account-grid" />
    <div className="account-orbit account-orbit-one" />
    <div className="account-orbit account-orbit-two" />
    <div className="account-sculpture">
      <div className="account-sculpture-ring" />
      <div className="account-brand-volume">
        <img src={symbol} alt="" width="280" height="200" />
        <img src={symbol} alt="" width="280" height="200" />
        <img src={symbol} alt="" width="280" height="200" />
      </div>
      <div className="account-brand-plinth" />
    </div>
  </div>;
}
