// src/ModelViewer.jsx

import React, { Suspense, useEffect, useRef, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, useAnimations, Html } from "@react-three/drei"
import * as THREE from "three"
import Header from "./Components/Header"
import DialogBox from "./Components/Learn/Lesson_Handler"
import { bodyPartInfo, bodyPartBounds, isPointInBounds, TechniqueMap, valueParts} from "./lib/BodyMap"

// Simple loader
function Loader() {
  return (
    <Html center>
      <div style={{ color: "white" }}>Loading 3D model...</div>
    </Html>
  )
}

// Camera rig helper
function useCameraRig() {
  const { camera, controls } = useThree((s) => ({ camera: s.camera, controls: s.controls }))
  return {
    camera,
    controls,
    setControlsEnabled(v) { if (controls) controls.enabled = v },
    setPanEnabled(v) { if (controls) controls.enablePan = v },
    reset() { if (controls) controls.reset() },
  }
}

// Fit camera to a box
function fitCameraToBox(camera, controls, box, opts = {}) {
  const { fillScale = 0.95, offsetUp = 0.06, offsetForward = 0.0 } = opts
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())

  const vFOV = THREE.MathUtils.degToRad(camera.fov)
  const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * camera.aspect)

  const distV = (size.y * 0.5) / Math.tan(vFOV / 2)
  const distH = (size.x * 0.5) / Math.tan(hFOV / 2)
  const distance = Math.max(distV, distH) * (1 / fillScale)

  const forward = new THREE.Vector3()
  camera.getWorldDirection(forward)
  const newPos = center.clone().sub(forward.multiplyScalar(distance))
  camera.position.copy(newPos)

  const up = new THREE.Vector3(0, 1, 0)
  const compTarget = center.clone().addScaledVector(up, offsetUp).addScaledVector(forward.normalize(), offsetForward)
  if (controls) { controls.target.copy(compTarget); controls.update() } else { camera.lookAt(compTarget) }

  const camToFarEdge = distance + size.length()
  camera.near = Math.max(0.01, distance - size.length() * 2)
  camera.far = Math.max(camera.far, camToFarEdge * 2)
  camera.updateProjectionMatrix()
}

// Build Box3 from ranges
function boxFromRanges(r) {
  return new THREE.Box3(
    new THREE.Vector3(r.x[0], r.y[0], r.z[0]),
    new THREE.Vector3(r.x[1], r.y[1], r.z[1])
  )
}

/** Main Model */
function Model({ scale = 1, tiltZ = 0, tiltX = 0, onSelectPart }) {
  const { scene, animations } = useGLTF("/models/base.glb")
  const { actions } = useAnimations(animations, scene)

  const headRef = useRef(null)
  const initialHeadRotation = useRef(new THREE.Euler(0, 0, 0))
  const { camera, controls, setControlsEnabled, setPanEnabled } = useCameraRig()

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      actions[Object.keys(actions)[0]].play()
    }
  }, [actions])

  useEffect(() => {
    const candidates = ["Head", "CC_Base_Head", "head", "mixamorigHead", "Armature_Head", "HeadMesh"]
    for (const n of candidates) {
      const obj = scene.getObjectByName(n)
      if (obj) {
        headRef.current = obj
        initialHeadRotation.current = obj.rotation.clone()
        break
      }
    }
  }, [scene])

  useEffect(() => {
    const node = headRef.current
    if (!node) return
    node.rotation.set(
      initialHeadRotation.current.x + tiltX,
      initialHeadRotation.current.y,
      initialHeadRotation.current.z + tiltZ
    )
  }, [tiltX, tiltZ])

  const focusHead = () => {
    const headBox = boxFromRanges(bodyPartBounds.HeadRegion.Head)
    setControlsEnabled(false)
    setPanEnabled(false)
    fitCameraToBox(camera, controls, headBox, { fillScale: 0.5 })
    requestAnimationFrame(() => { setControlsEnabled(true) })
    onSelectPart("Head")
  }

  const focusGeneric = (clickedObject, guessedPart) => {
    const box = new THREE.Box3().setFromObject(clickedObject)
    setControlsEnabled(false)
    setPanEnabled(false)
    fitCameraToBox(camera, controls, box, { fillScale: 1.0 })
    requestAnimationFrame(() => { setControlsEnabled(true) })
    onSelectPart(guessedPart)
  }

  const handlePointerDown = (e) => {
    e.stopPropagation()
    const meshName = e.object.name
    const p = e.point
    let guessedPart = "Unknown"

    try {
      if (meshName.includes("CC_Base_Body_1") || meshName.includes("CC_Base_Body_6") ||
          meshName.includes("Male_Brow_2_1") || meshName.includes("Male_Brow_2_2")) {
        const bounds = bodyPartBounds.HeadRegion?.Head
        if (bounds && isPointInBounds(p, bounds, "Head")) guessedPart = "Head"
      } else if (meshName.includes("CC_Base_Body_2") || meshName.includes("CC_Base_Body_1")) {
        for (const part of ["Left Rib", "Right Rib", "Abdomen", "Back"]) {
          const bounds = bodyPartBounds.TorsoAndBack?.[part]
          if (bounds && isPointInBounds(p, bounds, part)) { guessedPart = part; break }
        }
      } else {
        for (const part of Object.keys(bodyPartBounds.Legs)) {
          const bounds = bodyPartBounds.Legs?.[part]
          if (bounds && isPointInBounds(p, bounds, part)) { guessedPart = part; break }
        }
      }
    } catch (err) {
      console.warn("⚠️ Error while guessing body part:", err)
    }

    if (guessedPart === "Head") focusHead()
    else focusGeneric(e.object, guessedPart)
  }

  return <primitive object={scene} scale={2.4} position={[0, -2.15, 0]} onPointerDown={handlePointerDown} />
}

/** Main Viewer */
export default function ModelViewer() {
  const [tiltZ, setTiltZ] = useState(0)
  const [tiltX, setTiltX] = useState(0)
  const [selectedPart, setSelectedPart] = useState(null)
  const [showHeadControls, setShowHeadControls] = useState(false)
  const [showLearnDialog, setShowLearnDialog] = useState(false)
  const [expandedTechniques, setExpandedTechniques] = React.useState([]);


  const controlsRef = useRef(null)
  const initialCam = useRef(null)

  const step = (5 * Math.PI) / 180
  const maxZ = (45 * Math.PI) / 180
  const maxX = (45 * Math.PI) / 180

  const resetZ = () => setTiltZ(0)
  const resetX = () => setTiltX(0)

  const degZ = Math.round((tiltZ * 180) / Math.PI)
  const degX = Math.round((tiltX * 180) / Math.PI)

  useEffect(() => {
    const controls = controlsRef.current
    if (controls && !initialCam.current) {
      const cam = controls.object
      initialCam.current = {
        position: cam.position.clone(),
        target: controls.target.clone(),
        near: cam.near,
        far: cam.far,
        fov: cam.fov,
      }
      controls.saveState()
    }
  }, [])

  // Your toggle function
  const toggleTechnique = (technique) => {
    setExpandedTechniques(prev =>
      prev.includes(technique)
        ? prev.filter(t => t !== technique)
        : [...prev, technique]
    );
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

      <DialogBox
        isOpen={showLearnDialog}
        onClose={() => setShowLearnDialog(false)}
        title={`Techniques about positioning of ${bodyPartInfo[selectedPart]?.name || "Body Part"}`}
        // If DialogBox supports style prop, you can add style={{ maxWidth: "900px", width: "100%" }} here
      >
        {/* Increased width wrapper inside dialog */}
        <div
          style={{
            width: "100%",
            maxWidth: "900px",       // Increased max width here
            margin: "0 auto",
            padding: "8px 16px",
            overflowX: "auto",       // Prevent horizontal scrollbars
          }}
        >
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)", // 3 columns layout
              gap: "12px 16px",
              padding: 0,
              listStyle: "none",
              margin: 0,
              textAlign: "center",
              alignItems: "center",
            }}
          >
            {TechniqueMap.Head.map((technique, idx) => {
              const isExpanded = expandedTechniques.includes(technique);

              return (
                <li
                  key={idx}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    background: "#f8f8f8",
                    cursor: "pointer",
                    userSelect: "none",
                    padding: "8px 12px",
                    gridColumn: "auto",
                    minWidth: "180px",
                    boxSizing: "border-box",
                    wordBreak: "break-word",
                    overflow: "visible",
                  }}
                  onClick={() => toggleTechnique(technique)}
                >
                  <strong>{technique}</strong>
                  {isExpanded && (
                    <ul
                      style={{
                        listStyle: "disc",
                        paddingLeft: "20px",
                        marginTop: "6px",
                        marginBottom: "0",
                        fontSize: "14px",
                        background: "#fff",
                        borderRadius: "4px",
                      }}
                    >
                      {valueParts[technique]?.map((lesson, lessonIdx) => (
                        <li key={lessonIdx} style={{ marginBottom: 4 }}>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </DialogBox>

      {/* Overlay Info Box */}
      {selectedPart && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.85)",
            padding: "16px",
            borderRadius: "8px",
            color: "white",
            minWidth: "320px",
            maxWidth: "480px",
            textAlign: "center",
            border: "1px solid #555",
            boxShadow: "0 0 12px rgba(0,0,0,0.8)",
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{bodyPartInfo[selectedPart]?.name}</div>
          <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
            {bodyPartInfo[selectedPart]?.description}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["Learn", "Evaluate", "Close"].map((label) => {
              let onClick;
              let bgColor;
              if (label === "Learn") {
                onClick = () => setShowLearnDialog(true);
                bgColor = "#2a72ff";
              } else if (label === "Evaluate") {
                onClick = () => alert(`Evaluate ${bodyPartInfo[selectedPart]?.name}`);
                bgColor = "#00b894";
              } else if (label === "Close") {
                onClick = () => {
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
                bgColor = "#444";
              }
              return (
                <button
                  key={label}
                  onClick={onClick}
                  style={{
                    padding: "8px 16px",
                    minWidth: "90px",
                    backgroundColor: bgColor,
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: "600",
                    userSelect: "none",
                    flex: "1 1 auto",
                    textAlign: "center",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Head controls popup */}
          {showHeadControls && selectedPart === "Head" && (
            <div
              style={{
                marginTop: 20,
                padding: 12,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                userSelect: "none",
              }}
            >
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
          )}
        </div>
      )}
    </div>
  </div>
);

}


