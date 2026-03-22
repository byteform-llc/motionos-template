import { Player } from "@remotion/player";
import {
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
  DURATION_IN_FRAMES,
} from "./constants";
import MyComposition from "./remotion/Composition";

export default function Preview() {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-8">
      <Player
        component={MyComposition}
        durationInFrames={DURATION_IN_FRAMES}
        fps={COMPOSITION_FPS}
        compositionWidth={COMPOSITION_WIDTH}
        compositionHeight={COMPOSITION_HEIGHT}
        controls
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          minWidth: 0,
          width: "100%",
        }}
      />
    </div>
  );
}
