import React from "react";

export default function HeadControls({
  degX, degZ, tiltX, tiltZ, setTiltX, setTiltZ, step, maxX, maxZ, resetX, resetZ
}) {
  return (
    <div style={{
      marginTop: 20,
      padding: 12,
      background: "rgba(255,255,255,0.1)",
      borderRadius: 6,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      userSelect: "none",
    }}>
      <div>Front tilt (X): {degX}°</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => setTiltX((v) => Math.max(v - step, -maxX))}>Look Up −5°</button>
        <button onClick={resetX}>Reset</button>
        <button onClick={() => setTiltX((v) => Math.min(v + step, maxX))}>Look Down +5°</button>
      </div>
      <div>Side tilt (Z): {degZ}°</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => setTiltZ((v) => Math.max(v - step, -maxZ))}>Tilt Left −5°</button>
        <button onClick={resetZ}>Reset</button>
        <button onClick={() => setTiltZ((v) => Math.min(v + step, maxZ))}>Tilt Right +5°</button>
      </div>
    </div>
  );
}
