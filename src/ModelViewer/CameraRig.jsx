import { useThree } from "@react-three/fiber";

export default function useCameraRig() {
  const { camera, controls } = useThree((s) => ({
    camera: s.camera, controls: s.controls
  }));
  return {
    camera,
    controls,
    setControlsEnabled: (v) => controls && (controls.enabled = v),
    setPanEnabled: (v) => controls && (controls.enablePan = v),
    reset: () => controls && controls.reset(),
  };
}
