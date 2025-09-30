// src/lib/BodyMap.js

// Human-readable info about body parts
export const bodyPartInfo = {
  Head: { name: "Skull", description: "Controls head and facial orientation." }, // merged Face + Neck
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

// Coordinate bounds for different regions (used for hit-testing a click point)
export const bodyPartBounds = {
  HeadRegion: {
  Head: {   // merged Face + Backhead + Neck
    x: [-0.2, 0.2],
    y: [1.54, 2.2],  // min y of Neck to max y of Backhead
    z: [-0.35, 0.25], // full z-range of front + back
  }
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
    "Left Leg": { x: [0.1, 0.4], y: [-1.3, -0.4], z: [-0.2, 0.2] },
    "Right Leg": { x: [-0.4, -0.1], y: [-1.3, -0.4], z: [-0.2, 0.2] },
    "Left Feet": { x: [0.1, 0.4], y: [-2.6, -1.3], z: [-0.35, 0.2] },
    "Right Feet": { x: [-0.4, -0.1], y: [-1.6, -1.3], z: [-0.35, 0.2] },
  },
}

// Small tolerances
export const epsilon = 0.001
export const margin = 0.05

// Utility: check if a point lies in bounds
export const isPointInBounds = (point, bounds, label = "Part") => {
  const insideX = point.x + epsilon >= bounds.x[0] - margin && point.x - epsilon <= bounds.x[1] + margin
  const insideY = point.y + epsilon >= bounds.y[0] - margin && point.y - epsilon <= bounds.y[1] + margin
  const insideZ = point.z + epsilon >= bounds.z[0] - margin && point.z - epsilon <= bounds.z[1] + margin
  if (process.env.NODE_ENV !== "production") {
    console.log(`🔎 Checking ${label}: X=${point.x.toFixed(3)}, Y=${point.y.toFixed(3)}, Z=${point.z.toFixed(3)} → ${insideX && insideY && insideZ}`)
  }
  return insideX && insideY && insideZ
}


export const TechniqueMap = {
  Head: [
    "Skull Projection",
    "Sella Turcica",
    "Optic Canal",
    "Sphenoid Strut",
    "Superior Orbital",
    "Inferior Orbital",
    "Eye-Foreign Body",
    "Facial Bone",
    "Nasal Bone",
    "Zygomatic Arches",
    "Mandible",
    "Temporomandibular",
    "Sinuses",
    "Mastoid",
    "Petrous Portion",
    "Temporal Bone",
    "Jugular Foramina",
    "Hypoglossal Canal"
  ]
}

export const valueParts = {
  "Skull Projection" : ["PA Projection","AP Projection", "Modified Caldwell Method", "AP Axial Projection", "Original Caldwell", "Lateral Projection", "Crosstable Lateral", "Towne/Altschul/Grashey/Chamberlaine Method (AP Axial Projection)", "Haas Method", "Schuller/Pfeiffer Method", "Shuller Method", "Lysholm Method", "Valdini Method"],

  "Sella Turcica" : ["Lateral Projection","Towne Method","Haas Method","PA Projection"],

  "Optic Canal" : ["Rhese Method (Parieto-Orbital Oblique Projection)","Rhese Method (Orbito-Parietal Oblique Projection)","Alexander Method","Modified Lysholm Method"],

  "Sphenoid Strut" : ["Hough Method"],

  "Superior Orbital" : ["Caldwell Method"],

  "Inferior Orbital" : ["Bertel Method "],

  "Eye-Foreign Body" : ["Lateral Projection","PA Axial Projection", "Modified Waters Method"],

  "Facial Bone" : ["Lateral Projection","Waters Method","Modified Waters","Reverse Waters Method ","Caldwell Method", "Law Method"],

  "Nasal Bone" : ["Lateral Projection","Tangential Projection","Waters Method"],

  "Zygomatic Arches" : ["Schuller/Pfeiffer Method","Modified Titterington Method","May Method ","Modified Towne Method"],

  "Mandible" : ["PA Projection","PA Axial Projection","PA Projection","PA Axial Projection","Axiolateral Oblique Projection", "Schuller/Pfeiffer Method", "Schuller Method"],

  "Temporomandibular" : ["Towne Method ","Axiolateral Projection","Schuller Method","Inferosuperior Transfacial Position","Albers-Schonberg Method", "Zanelli Method"],

  "Sinuses" : ["Lateral Projection","PA Projection","Caldwell Method","Waters Method","Open-Mouth Waters Method", "Submentovertical Projetion", "Verticosubmetal Projection", "Pirie Method", "Rhese Method", "Law Method"],

  "Mastoid": ["Law Method", "Single Angulation Method", "Part Angulation Method", "Part Angulation Method", "PA Tangential Position", "Towne Method", "Henschen, Schuller, & Lysholm Method"],
 
  "Petrous Portion": ["Towne Method", "Haas Method", "Valdini Method", "Schuller/Pfeiffer Method", "Mayer Method", "Stenvers Method", "Arcelin Method", "Modified Law Method"],

  "Temporal Bone": ["Cahoon Method "],

  "Jugular Foramina": ["Kemp Harper Method"],

  "Hypoglossal Canal": ["Miller Method "]
}
