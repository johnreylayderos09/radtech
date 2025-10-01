import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import useCameraRig from "./CameraRig";
import { fitCameraToBox, boxFromRanges } from "./CameraUtils";
import { bodyPartBounds, isPointInBounds } from "../lib/BodyMap";

export default function Model({ scale = 1, tiltZ = 0, tiltX = 0, onSelectPart }) {
  const { scene, animations } = useGLTF("/models/base.glb");
  const { actions } = useAnimations(animations, scene);

  const headRef = useRef(null);
  const initialHeadRotation = useRef(new THREE.Euler(0, 0, 0));
  const { camera, controls, setControlsEnabled, setPanEnabled } = useCameraRig();

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      actions[Object.keys(actions)[0]].play();
    }
  }, [actions]);

  useEffect(() => {
    const candidates = ["Head", "CC_Base_Head", "head", "mixamorigHead", "Armature_Head", "HeadMesh"];
    for (const n of candidates) {
      const obj = scene.getObjectByName(n);
      if (obj) {
        headRef.current = obj;
        initialHeadRotation.current = obj.rotation.clone();
        break;
      }
    }
  }, [scene]);

  useEffect(() => {
    const node = headRef.current;
    if (!node) return;
    node.rotation.set(
      initialHeadRotation.current.x + tiltX,
      initialHeadRotation.current.y,
      initialHeadRotation.current.z + tiltZ
    );
  }, [tiltX, tiltZ]);

  const focusHead = () => {
    const headBox = boxFromRanges(bodyPartBounds.HeadRegion.Head);
    setControlsEnabled(false);
    setPanEnabled(false);
    fitCameraToBox(camera, controls, headBox, { fillScale: 0.5 });
    requestAnimationFrame(() => { setControlsEnabled(true); });
    onSelectPart("Head");
  };

  const focusGeneric = (clickedObject, guessedPart) => {
    const box = new THREE.Box3().setFromObject(clickedObject);
    setControlsEnabled(false);
    setPanEnabled(false);
    fitCameraToBox(camera, controls, box, { fillScale: 1.0 });
    requestAnimationFrame(() => { setControlsEnabled(true); });
    onSelectPart(guessedPart);
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const meshName = e.object.name;
    const p = e.point;
    let guessedPart = "Unknown";
    try {
      if (meshName.includes("CC_Base_Body_1") || meshName.includes("CC_Base_Body_6") ||
          meshName.includes("Male_Brow_2_1") || meshName.includes("Male_Brow_2_2")) {
        const bounds = bodyPartBounds.HeadRegion?.Head;
        if (bounds && isPointInBounds(p, bounds, "Head")) guessedPart = "Head";
      } else if (meshName.includes("CC_Base_Body_2") || meshName.includes("CC_Base_Body_1")) {
        for (const part of ["Left Rib", "Right Rib", "Abdomen", "Back"]) {
          const bounds = bodyPartBounds.TorsoAndBack?.[part];
          if (bounds && isPointInBounds(p, bounds, part)) { guessedPart = part; break; }
        }
      } else {
        for (const part of Object.keys(bodyPartBounds.Legs)) {
          const bounds = bodyPartBounds.Legs?.[part];
          if (bounds && isPointInBounds(p, bounds, part)) { guessedPart = part; break; }
        }
      }
    } catch (err) {
      console.warn("⚠️ Error while guessing body part:", err);
    }

    if (guessedPart === "Head") focusHead();
    else focusGeneric(e.object, guessedPart);
  };

  const [modelScale, setModelScale] = useState(2.4);
  const [modelPOS, setModelPOS] = useState([0, -2.30, 0]);
  const [wasMobile, setWasMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setModelScale(isMobile ? 1.9 : 2.4);
      setModelPOS(isMobile ? [0, -1.80, 0] : [0, -2.30, 0]);
      if (wasMobile && !isMobile) window.location.reload();
      setWasMobile(isMobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [wasMobile]);

  return <primitive object={scene} scale={modelScale} position={modelPOS} onPointerDown={handlePointerDown} />;
}
