import "./index.css";
import { Composition } from "remotion";
import MyComposition, { CompositionSettings } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={CompositionSettings.durationInFrames}
        fps={CompositionSettings.fps}
        width={CompositionSettings.width}
        height={CompositionSettings.height}
      />
    </>
  );
};
