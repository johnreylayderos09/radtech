import React, { useState } from "react";

export default function TechniqueDialog({
  isOpen,
  onClose,
  title,
  TechniqueMap,
  valueParts,
  selectedPart,
  onRedirect, // function to handle navigation/redirection
}) {
  const [exampleDialogOpen, setExampleDialogOpen] = useState(false);
  const [selectedExampleTechnique, setSelectedExampleTechnique] = useState(null);

  if (!isOpen) return null;

  const handleExampleOpen = (technique) => {
    setSelectedExampleTechnique(technique);
    setExampleDialogOpen(true);
  };

  const handleExampleClose = () => {
    setSelectedExampleTechnique(null);
    setExampleDialogOpen(false);
  };

  const handleTechniqueClick = (technique) => {
    // Open the example detail modal
    handleExampleOpen(technique);
    // If preferred, you can call onRedirect here to redirect instead of opening modal
  };

const handleRedirect = (lesson) => {
  alert(`Category: ${selectedPart}\nTechnique: ${selectedExampleTechnique}\nLesson: ${lesson}`);
  onRedirect && onRedirect(lesson);
};



  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(30, 40, 60, 0.56)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Main Dialog */}
      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 10,
          maxWidth: 900,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 0 22px #1b1b1b",
          padding: "22px 28px 28px",
        }}
      >
        {/* Main Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ✕
        </button>

        {/* Title */}
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
          {title}
        </div>

        {/* Techniques Grid */}
        <div style={{ width: "100%", margin: "0 auto" }}>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              padding: 0,
              listStyle: "none",
              margin: 0,
              textAlign: "center",
            }}
          >
            {(TechniqueMap[selectedPart] || []).map((technique, idx) => (
              <li
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: "#f8f8f8",
                  cursor: "pointer",
                  userSelect: "none",
                  padding: "10px 14px",
                  boxSizing: "border-box",
                  wordBreak: "break-word",
                  transition: "background 0.2s ease-in-out",
                }}
                onClick={() => handleTechniqueClick(technique)}
              >
                <strong>{technique}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Secondary Pop-up Dialog for Examples */}
      {exampleDialogOpen && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(30,40,60, 0.16)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              // No top or right padding to keep X flush with edges
              padding: "24px 0 28px 32px", 
              maxWidth: 540,
              boxShadow: "0 0 18px #191a32",
              position: "relative",
              width: "90%",
              textAlign: 'center'
            }}
          >
            {/* Flush Close Button at Top-Right Edge */}
            <button
              onClick={handleExampleClose}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                background: "transparent",
                color: "#f00",
                border: "none",
                borderRadius: 0,
                padding: 0,
                margin: 0,
                fontSize: 28,
                cursor: "pointer",
                lineHeight: "1",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close examples dialog"
            >
              &#10006;
            </button>

            {/* Selected Technique Title */}
            <div
              style={{
                fontWeight: 600,
                fontSize: 19,
                marginBottom: 16,
                paddingRight: 40, // avoid overlap with close button
              }}
            >
              {selectedExampleTechnique}
            </div>

            {/* Example lessons list with clickable redirect */}
            <ul style={{ fontSize: 15, margin: 0, paddingRight: 32 }}>
              {(valueParts[selectedExampleTechnique] || []).map(
                (lesson, lessonIdx) => (
                  <li
                    key={lessonIdx}
                    style={{
                      marginBottom: 7,
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "underline",
                    }}
                    onClick={() => handleRedirect(lesson)}
                    tabIndex={0}
                    role="link"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleRedirect(lesson);
                      }
                    }}
                  >
                    {lesson}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
