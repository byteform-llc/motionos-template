import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import MyComposition, { compositionConfig } from "./Composition";
import { createRoot } from "react-dom/client";
import "./preview.css";

type EventData =
  | { type: "set_theme"; theme: string }
  | { type: "player.seek_to"; frame: number }
  | { type: "player.play" }
  | { type: "player.pause" }
  | { type: "player.toggle" }
  | { type: "player.mute" }
  | { type: "player.unmute" }
  | { type: "player.request_fullscreen" }
  | { type: "player.exit_fullscreen" };

function Preview() {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (!window.parent) return;

    const onMessage = (event: MessageEvent<EventData>) => {
      if (event.origin !== window.parent.origin) return;
      const data = event.data;

      switch (data.type) {
        case "set_theme":
          document.documentElement.classList.remove("light", "dark");
          document.documentElement.classList.add(data.theme);
          break;
        case "player.seek_to":
          playerRef.current?.seekTo(data.frame);
          break;
        case "player.play":
          playerRef.current?.play();
          break;
        case "player.pause":
          playerRef.current?.pause();
          break;
        case "player.toggle":
          playerRef.current?.toggle();
          break;
        case "player.mute":
          playerRef.current?.mute();
          break;
        case "player.unmute":
          playerRef.current?.unmute();
          break;
        case "player.request_fullscreen":
          playerRef.current?.requestFullscreen();
          break;
        case "player.exit_fullscreen":
          playerRef.current?.exitFullscreen();
          break;
      }
    };

    window.parent.postMessage({ type: "preview_loaded" }, "*");

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Player
        ref={playerRef}
        component={MyComposition}
        durationInFrames={compositionConfig.durationInFrames}
        fps={compositionConfig.fps}
        compositionWidth={compositionConfig.width}
        compositionHeight={compositionConfig.height}
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

createRoot(document.getElementById("root")!).render(<Preview />);
