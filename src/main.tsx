import { Composition, registerRoot } from "remotion";
import "./index.css";
import MyComposition, { compositionConfig } from "./Composition";

function Root() {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={compositionConfig.durationInFrames}
        fps={compositionConfig.fps}
        width={compositionConfig.width}
        height={compositionConfig.height}
      />
    </>
  );
}

registerRoot(Root);
