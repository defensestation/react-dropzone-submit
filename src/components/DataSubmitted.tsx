import { Player } from "@lottiefiles/react-lottie-player";
import jsonPlayerData from "@/assets/lottie-animations/data-submitted.json";

export default function DataSubmitted() {
  return (
    <Player
      autoplay
      keepLastFrame
      src={jsonPlayerData}
      style={{ height: "300px", width: "300px" }}
    ></Player>
  );
}
