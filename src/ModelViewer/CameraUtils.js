import * as THREE from "three";

// Fit camera to a box3
export function fitCameraToBox(camera, controls, box, opts = {}) {
  const { fillScale = 0.95, offsetUp = 0.06, offsetForward = 0.0 } = opts;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const vFOV = THREE.MathUtils.degToRad(camera.fov);
  const hFOV = 2 * Math.atan(Math.tan(vFOV / 2) * camera.aspect);

  const distV = (size.y * 0.5) / Math.tan(vFOV / 2);
  const distH = (size.x * 0.5) / Math.tan(hFOV / 2);
  const distance = Math.max(distV, distH) * (1 / fillScale);

  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const newPos = center.clone().sub(forward.multiplyScalar(distance));
  camera.position.copy(newPos);

  const up = new THREE.Vector3(0, 1, 0);
  const compTarget = center
    .clone()
    .addScaledVector(up, offsetUp)
    .addScaledVector(forward.normalize(), offsetForward);
  if (controls) { controls.target.copy(compTarget); controls.update(); }
  else { camera.lookAt(compTarget); }

  const camToFarEdge = distance + size.length();
  camera.near = Math.max(0.01, distance - size.length() * 2);
  camera.far = Math.max(camera.far, camToFarEdge * 2);
  camera.updateProjectionMatrix();
}

export function boxFromRanges(r) {
  return new THREE.Box3(
    new THREE.Vector3(r.x[0], r.y[0], r.z[0]),
    new THREE.Vector3(r.x[1], r.y[1], r.z[1])
  );
}
