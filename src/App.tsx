/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import "./App.css";
import AxiosHttpClient from "./shared/AxiosClient";
import DamageView from "./views/DamageView";

function App() {
  const [isAppReady, setAppReady] = useState(false);
  useEffect(() => {
    AxiosHttpClient.init("http://172.16.120.24:7005/api/");

    setTimeout(() => {
      setAppReady(true);
    }, 100);

    return () => {};
  }, []);

  return (
    <>
      {/* <canvas
        ref={canvasRef}
        id="canvas"
        style={{ border: "1px solid black" }}
      /> */}
      {isAppReady && <DamageView />}
      {/* <div style={{ height: "80vh" }}>
        {!isPropEmpty(controlSetting) && (
          <Controller
            controllerSettings={controlSetting}
            canPan={false}
            canZoom={false}
            heatMapShown={true}
            isHoverAllowed={false}
            objectTitleVisibilityCodes={{
              text: "Minor",
              visibilityCodes: [2, 3, 1],
            }}
            hoverTextVisibilityCode={[9, 11, 12]}
            currentBackgroundPath={null}
          />
        )}
      </div> */}
    </>
  );
}

export default App;
