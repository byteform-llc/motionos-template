import { Player } from "@remotion/player";
import MyComposition, { CompositionSettings } from "./Composition";

export default function Preview() {
  return (
    <div className="h-screen w-screen flex items-center justify-center p-8">
      <Player
        component={MyComposition}
        durationInFrames={CompositionSettings.durationInFrames}
        fps={CompositionSettings.fps}
        compositionWidth={CompositionSettings.width}
        compositionHeight={CompositionSettings.height}
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
