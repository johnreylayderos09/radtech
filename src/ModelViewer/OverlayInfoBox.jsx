
import HeadControls from "./HeadControls";

export default function OverlayInfoBox({
  selectedPart, bodyPartInfo, onLearnClick, onClose, onEvaluateClick,
  showHeadControls, degX, degZ, tiltX, tiltZ, setTiltX, setTiltZ, step, maxX, maxZ, resetX, resetZ
}) {
  if (!selectedPart) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.85)",
        padding: 16,
        borderRadius: 8,
        color: "white",
        minWidth: 320,
        maxWidth: 480,
        textAlign: "center",
        border: "1px solid #555",
        boxShadow: "0 0 12px rgba(0,0,0,0.8)",
        zIndex: 10,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{bodyPartInfo[selectedPart]?.name}</div>
      <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
        {bodyPartInfo[selectedPart]?.description}
      </p>
      <div style={{
        display: "flex", gap: 12, marginTop: 14, justifyContent: "center", flexWrap: "wrap"
      }}>
        <button
          onClick={onLearnClick}
          style={{padding: "8px 16px", minWidth: 90, backgroundColor: "#2a72ff", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, userSelect: "none", flex: "1 1 auto", textAlign: "center"}}
        >Learn</button>
        <button
          onClick={onEvaluateClick}
          style={{padding: "8px 16px", minWidth: 90, backgroundColor: "#00b894", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, userSelect: "none", flex: "1 1 auto", textAlign: "center"}}
        >Evaluate</button>
        <button
          onClick={onClose}
          style={{padding: "8px 16px", minWidth: 90, backgroundColor: "#444", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, userSelect: "none", flex: "1 1 auto", textAlign: "center"}}
        >Close</button>
      </div>
      {showHeadControls &&
        <HeadControls
          degX={degX}
          degZ={degZ}
          tiltX={tiltX}
          tiltZ={tiltZ}
          setTiltX={setTiltX}
          setTiltZ={setTiltZ}
          step={step}
          maxX={maxX}
          maxZ={maxZ}
          resetX={resetX}
          resetZ={resetZ}
        />
      }
    </div>
  );
}
