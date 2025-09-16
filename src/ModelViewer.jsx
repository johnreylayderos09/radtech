import React, { Suspense, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, useGLTF, useAnimations, Html } from "@react-three/drei"
import Header from "./Components/Header"

/** Loader while model is being fetched */
function Loader() {
  return (
    <Html center>
      <div style={{ color: "white" }}>Loading 3D model...</div>
    </Html>
  )
}

/** Info dictionary for body parts */
const bodyPartInfo = {
  Head: { name: "Head", description: "Controls head and facial orientation." },
  Face: { name: "Face", description: "Front part of the head." },
  Neck: { name: "Neck", description: "Connects head to torso." },
  Backhead: { name: "Back of Head", description: "Back side of the head, extending toward lower skull." },
  Torso: { name: "Torso", description: "Controls upper body movements." },
  "Left Arm": { name: "Left Arm", description: "Controls movements of the left arm." },
  "Right Arm": { name: "Right Arm", description: "Controls movements of the right arm." },
  "Left Hand": { name: "Left Hand", description: "Controls movements of the left hand." },
  "Right Hand": { name: "Right Hand", description: "Controls movements of the right hand." },
  "Left Shoulder": { name: "Left Shoulder", description: "Left shoulder area of the torso." },
  "Right Shoulder": { name: "Right Shoulder", description: "Right shoulder area of the torso." },
  "Left Rib": { name: "Left Rib", description: "Left rib cage area of the torso." },
  "Right Rib": { name: "Right Rib", description: "Right rib cage area of the torso." },
  Abdomen: { name: "Abdomen", description: "Lower front torso region." },
  Back: { name: "Back", description: "Back part of the body." },
  Groin: { name: "Groin", description: "Area between the abdomen and thighs." },
  "Left Thigh": { name: "Left Thigh", description: "Upper part of the left leg." },
  "Right Thigh": { name: "Right Thigh", description: "Upper part of the right leg." },
  "Left Leg": { name: "Left Leg", description: "Lower part of the left leg." },
  "Right Leg": { name: "Right Leg", description: "Lower part of the right leg." },
  "Left Feet": { name: "Left Foot", description: "Controls movements of the left foot." },
  "Right Feet": { name: "Right Foot", description: "Controls movements of the right foot." },
  Unknown: { name: "Unknown Part", description: "No specific information available for this part." },
}

/** Coordinate bounds for different regions */
const bodyPartBounds = {
  
  HeadRegion: {
  Face: { x: [-0.18, 0.18], y: [1.70, 2.07], z: [0.04, 0.17] },
  Backhead: { x: [-0.2, 0.2], y: [1.55, 2.2], z: [-0.35, -0.001] },
  Neck: { x: [-0.12, 0.12], y: [1.54, 1.70], z: [-0.03, 0.09] },
  },

  LeftArmAndHand: { x: [1.29, 1.6], y: [0.74, 0.96], z: [-0.2, 0.06] },
  RightArmAndHand: { x: [-1.6, -1.25], y: [0.75, 1.0], z: [-0.2, 0.06] },
  
  TorsoAndBack: {
    "Left Shoulder": { x: [0.2, 0.5], y: [1.3, 1.6], z: [-0.03, 0.1] },
    "Right Shoulder": { x: [-0.62, -0.28], y: [1.18, 1.62], z: [-0.27, 0.27] },
    "Left Rib": { x: [0.07, 0.35], y: [1.0, 1.42], z: [0.06, 0.25] },
    "Right Rib": { x: [-0.35, -0.01], y: [0.85, 1.5], z: [0.1, 0.22] },
    Abdomen: { x: [-0.3, 0.3], y: [0.5, 0.9], z: [0.05, 0.22] },
    Back: { x: [-0.3, 0.3], y: [0.6, 1.4], z: [-0.4, -0.05] },
  },

  Legs: {
    "Left Thigh": { x: [0.01, 0.55], y: [-0.35, 0.2], z: [-0.15, 0.25] },
    "Right Thigh": { x: [-0.55, -0.05], y: [-0.35, 0.2], z: [-0.2, 0.25] }, 
    "Left Leg":  { x: [0.1, 0.4],  y: [-1.3, -0.4], z: [-0.2, 0.2] },
    "Right Leg": { x: [-0.4, -0.1], y: [-1.3, -0.4], z: [-0.2, 0.2] },
    "Left Feet": { x: [0.1, 0.4],  y: [-1.6, -1.3], z: [-0.35, 0.2] },
    "Right Feet": { x: [-0.4, -0.1], y: [-1.6, -1.3], z: [-0.35, 0.2] },
  }
}
const epsilon = 0.001
const margin = 0.05

/** Utility: check if point lies in bounds */
const isPointInBounds = (point, bounds, label = "Part") => {
  const insideX = point.x + epsilon >= bounds.x[0] - margin && point.x - epsilon <= bounds.x[1] + margin
  const insideY = point.y + epsilon >= bounds.y[0] - margin && point.y - epsilon <= bounds.y[1] + margin
  const insideZ = point.z + epsilon >= bounds.z[0] - margin && point.z - epsilon <= bounds.z[1] + margin

  console.log(`🔎 Checking ${label}: X=${point.x.toFixed(3)}, Y=${point.y.toFixed(3)}, Z=${point.z.toFixed(3)} → ${insideX && insideY && insideZ}`)
  return insideX && insideY && insideZ
}

/** Main Model */
function Model({ scale = 1 }) {
  const { scene, animations } = useGLTF("/models/base.glb")
  const { actions } = useAnimations(animations, scene)

  const [selectedPart, setSelectedPart] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState([0, 0, 0])

  /** Auto-play first animation */
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      actions[Object.keys(actions)[0]].play()
    }
  }, [actions])

  /** Handle clicks */
  const handlePointerDown = (e) => {
    e.stopPropagation()
    const meshName = e.object.name
    const clickedPoint = e.point

    console.log("🟢 Clicked Mesh:", meshName, "📍 Point:", clickedPoint)

    let guessedPart = "Unknown"

    if (
      meshName.includes("CC_Base_Body_1") ||
      meshName.includes("CC_Base_Body_6") ||
      meshName.includes("Male_Brow_2_1") ||
      meshName.includes("Male_Brow_2_2")
    ) {
      for (const part of ["Face", "Backhead", "Neck"]) {
        if (isPointInBounds(clickedPoint, bodyPartBounds.HeadRegion[part], part)) {
          guessedPart = part
          break
        }
      }
    } else if (meshName.includes("CC_Base_Body_2") || meshName.includes("CC_Base_Body_1")) {
      for (const part of ["Left Rib", "Right Rib", "Abdomen", "Back"]) {
        if (isPointInBounds(clickedPoint, bodyPartBounds.TorsoAndBack[part], part)) {
          guessedPart = part
          break
        }
      }
    } else if (meshName.includes("CC_Base_Body_3") || meshName.includes("CC_Base_Body_5")) {
      if (isPointInBounds(clickedPoint, bodyPartBounds.TorsoAndBack["Left Shoulder"], "Left Shoulder")) {
        guessedPart = "Left Shoulder"
      } else if (isPointInBounds(clickedPoint, bodyPartBounds.TorsoAndBack["Right Shoulder"], "Right Shoulder")) {
        guessedPart = "Right Shoulder"
      } else if (isPointInBounds(clickedPoint, bodyPartBounds.LeftArmAndHand, "Left Hand")) {
        guessedPart = "Left Hand"
      } else if (isPointInBounds(clickedPoint, bodyPartBounds.RightArmAndHand, "Right Hand")) {
        guessedPart = "Right Hand"
      }
    }
    else if (meshName.includes("Boxer")) {
      guessedPart = "Groin"
    }

    else if (meshName.includes("CC_Base_Body_4")) {
      if (isPointInBounds(clickedPoint, bodyPartBounds.Legs["Left Thigh"], "Left Thigh")) {
        guessedPart = "Left Thigh"
      } else if (isPointInBounds(clickedPoint, bodyPartBounds.Legs["Right Thigh"], "Right Thigh")) {
        guessedPart = "Right Thigh"
      }
      else if (isPointInBounds(clickedPoint, bodyPartBounds.Legs["Left Leg"], "Left Leg")) {
        guessedPart = "Left Leg"
      } else if (isPointInBounds(clickedPoint, bodyPartBounds.Legs["Right Leg"], "Right Leg")) {
        guessedPart = "Right Leg"
      }
      else if (isPointInBounds(clickedPoint, bodyPartBounds.Legs["Left Feet"], "Left Foot")) {
        guessedPart = "Left Feet"
      } else if (isPointInBounds(clickedPoint, bodyPartBounds.Legs["Right Feet"], "Right Foot")) {
        guessedPart = "Right Feet"
      }
    }


    setSelectedPart(guessedPart)
    setSelectedPosition([clickedPoint.x, clickedPoint.y + 0.3, clickedPoint.z])
  }

  return (
    <>
      <primitive object={scene} scale={scale} position={[0, -2.15, 0]} onPointerDown={handlePointerDown} />

      {selectedPart && (
        <Html position={selectedPosition} distanceFactor={10}>
          <div
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              padding: "8px",
              borderRadius: "6px",
              color: "white",
              fontSize: "13px",
              minWidth: "180px",
              border: "1px solid white",
            }}
          >
            <strong>{bodyPartInfo[selectedPart]?.name}</strong>
            <p>{bodyPartInfo[selectedPart]?.description}</p>
            <button
              style={{ marginTop: "5px", padding: "4px 8px", cursor: "pointer", background: "#222", color: "white" }}
              onClick={() => setSelectedPart(null)}
            >
              Close
            </button>
          </div>
        </Html>
      )}
    </>
  )
}

/** Viewer Wrapper */
export default function ModelViewer() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "white", display: "flex", flexDirection: "column" }}>
      
      {/* Header always on top */}
      <Header />

      {/* 3D Canvas takes remaining space */}
      <div style={{ flex: 1 }}>
        <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          <Suspense fallback={<Loader />}>
            <Model scale={2.4} />
          </Suspense>

          {/* <OrbitControls makeDefault zoomToCursor={true} /> */}
          
          <OrbitControls/>
        </Canvas>
      </div>
    </div>
  )
}
