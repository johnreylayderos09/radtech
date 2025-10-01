import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Header from "../Components/Header";
import Loader from "./Loader";
import Model from "./Model";
import OverlayInfoBox from "./OverlayInfoBox";
import TechniqueDialog from "./TechniqueDialog";
import { bodyPartInfo, TechniqueMap, valueParts } from "../lib/BodyMap";

export default function ModelViewer() {
  const [tiltZ, setTiltZ] = useState(0);
  const [tiltX, setTiltX] = useState(0);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showHeadControls, setShowHeadControls] = useState(false);
  const [showLearnDialog, setShowLearnDialog] = useState(false);
  const [expandedTechniques, setExpandedTechniques] = useState([]);

  const controlsRef = useRef(null);
  const initialCam = useRef(null);

  const step = (5 * Math.PI) / 180;
  const maxZ = (45 * Math.PI) / 180;
  const maxX = (45 * Math.PI) / 180;

  const resetZ = () => setTiltZ(0);
  const resetX = () => setTiltX(0);
  const degZ = Math.round((tiltZ * 180) / Math.PI);
  const degX = Math.round((tiltX * 180) / Math.PI);

  useEffect(() => {
    const controls = controlsRef.current;
    if (controls && !initialCam.current) {
      const cam = controls.object;
      initialCam.current = {
        position: cam.position.clone(),
        target: controls.target.clone(),
        near: cam.near,
        far: cam.far,
        fov: cam.fov,
      };
      controls.saveState();
    }
  }, []);

  const toggleTechnique = (technique) => {
    setExpandedTechniques(prev =>
      prev.includes(technique)
        ? prev.filter(t => t !== technique)
        : [...prev, technique]
    );
  };

  const handleLearnClick = () => setShowLearnDialog(true);
  const handleEvaluateClick = () => alert(`Evaluate ${bodyPartInfo[selectedPart]?.name}`);
  const handleClose = () => {
    setSelectedPart(null);
    setShowHeadControls(false);
    const controls = controlsRef.current;
    if (!controls) return;
    const cam = controls.object;
    controls.reset();
    if (initialCam.current) {
      cam.position.copy(initialCam.current.position);
      controls.target.copy(initialCam.current.target);
      cam.near = initialCam.current.near;
      cam.far = initialCam.current.far;
      cam.fov = initialCam.current.fov;
      cam.updateProjectionMatrix();
      controls.update();
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "white", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          <Suspense fallback={<Loader />}>
            <Model scale={2.4} tiltZ={tiltZ} tiltX={tiltX} onSelectPart={setSelectedPart} />
          </Suspense>
          <OrbitControls makeDefault ref={controlsRef} />
        </Canvas>
        <OverlayInfoBox
          selectedPart={selectedPart}
          bodyPartInfo={bodyPartInfo}
          onLearnClick={handleLearnClick}
          onClose={handleClose}
          onEvaluateClick={handleEvaluateClick}
          showHeadControls={showHeadControls}
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
        <TechniqueDialog
          isOpen={showLearnDialog}
          onClose={() => setShowLearnDialog(false)}
          title={`Techniques about positioning of ${bodyPartInfo[selectedPart]?.name || "Body Part"}`}
          TechniqueMap={TechniqueMap}
          valueParts={valueParts}
          expandedTechniques={expandedTechniques}
          toggleTechnique={toggleTechnique}
          selectedPart={selectedPart || "Head"}
        />
      </div>
    </div>
  );
}
