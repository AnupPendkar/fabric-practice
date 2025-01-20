import React, { useEffect, useRef, useState } from "react";
import Controller from "../overlay-controller/applications/Controller";
import { isPropEmpty } from "../utils/CommonUtils";
import { SegmentParserClass } from "../parsing-handlers/segment-parse";
import { ContainerPerspectiveType } from "../typings/damage-controller.typing";
import { ControllerSettings } from "@/overlay-controller/typings/platform-typings";

interface ParsedSidebarItem {
  icon: string;
  activated_icon: string;
  name: string;
  isActivated: boolean;
  sideID: number;
  perpectives: Array<string>;
}

const ViewDamage = ({
  sideInfo,
  damageConfig,
  sidePerspectives,
  setSideInfo,
  setDamageConfig,
  setSidePerspectives,
}) => {
  const [sideToggleModel, setSideToggleModel] = useState(false);
  const [heatMapToggleModel, setHeatMapToggleModel] = useState(false);
  const [filteredSidebarMenu, setFilteredSidebarMenu] = useState<
    ParsedSidebarItem[]
  >([]);
  const activeMenu = useRef<number>();

  const [isNoMinorDamagePresent, setNoMinorDamagePresent] = useState(false);
  const [getIsHeatMapImagePathEmpty, setHeapMapImagePathEmpty] = useState(true);
  const [controlSetting, setControlSetting] = useState<ControllerSettings>();

  const containerMetaData = [
    {
      label: "Container No",
      value: "TILLU1251324",
    },
    {
      label: "Major Damages",
      value: "0",
    },
    {
      label: "Total Damages",
      value: "7",
    },
    {
      label: "Minor Damages",
      value: "7",
    },
  ];

  function handleMainPersClk(
    _menu: ParsedSidebarItem,
    filtered = filteredSidebarMenu
  ) {
    const getFilteredSidebarMenu = filteredSidebarMenu?.length
      ? filteredSidebarMenu
      : filtered;

    if (!isPropEmpty(filtered)) {
      activeMenu.current = null;
    } else {
      activeMenu.current =
        _menu?.sideID === activeMenu.current ? null : _menu?.sideID;
    }

    const modifiedSidebarMenu = getFilteredSidebarMenu?.map((itm) => {
      if (itm?.sideID === _menu?.sideID) {
        itm.isActivated = true;
        if (itm.perpectives?.length <= 1 || !isPropEmpty(filtered)) {
          handlePersClk(_menu, itm?.perpectives?.[0]);
        }
      } else {
        itm.isActivated = false;
      }
      return itm;
    });

    setFilteredSidebarMenu([...modifiedSidebarMenu]);
  }

  function handlePersClk(menu: ParsedSidebarItem, pers: string) {
    setSideInfo({ side_id: menu?.sideID, side: pers });
    console.log(menu, pers);
  }

  function handleContainerSidePerpectives(sides: ContainerPerspectiveType[]) {
    const containerSideMenu: ParsedSidebarItem[] = [
      {
        icon: "damage-contoller/left.svg",
        activated_icon: "damage-contoller/Gleft.svg",
        name: "left",
        isActivated: false,
        sideID: 4,
        perpectives: [],
      },
      {
        icon: "damage-contoller/right.svg",
        activated_icon: "damage-contoller/Gright.svg",
        name: "right",
        isActivated: false,
        sideID: 3,
        perpectives: [],
      },
      {
        icon: "damage-contoller/top.svg",
        activated_icon: "damage-contoller/Gtop.svg",
        name: "top",
        isActivated: false,
        sideID: 5,
        perpectives: [],
      },
      {
        icon: "damage-contoller/back.svg",
        activated_icon: "damage-contoller/Gback.svg",
        name: "back",
        isActivated: false,
        sideID: 2,
        perpectives: [],
      },
      {
        icon: "damage-contoller/Front_Side.svg",
        activated_icon: "damage-contoller/GFront_Side.svg",
        name: "front",
        isActivated: false,
        sideID: 1,
        perpectives: [],
      },
    ];

    const map = new Map<number, string[]>();
    const sidesAvailable = [];
    sides?.forEach((side) => {
      sidesAvailable.push(side?.side_id);
      map.set(side?.side_id, side?.perspectives);
    });

    const modifiedSides = containerSideMenu
      ?.filter((side) => sidesAvailable?.includes(side?.sideID))
      ?.map((side) => {
        side.perpectives = map.get(side?.sideID);
        return side;
      });

    setFilteredSidebarMenu(modifiedSides);
  }

  useEffect(() => {
    setDamageConfig();
    setSidePerspectives();

    const timeout = setTimeout(() => {
      setFilteredSidebarMenu((val) => {
        activeMenu.current = null;
        handleMainPersClk(val?.[0], val);
        return val;
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!isPropEmpty(sideInfo) && !isPropEmpty(damageConfig)) {
      const data = new SegmentParserClass().generateSegments(
        sideInfo as any,
        damageConfig
      );
      setControlSetting(data);
    }
  }, [sideInfo, damageConfig]);

  useEffect(() => {
    if (!isPropEmpty(sidePerspectives))
      handleContainerSidePerpectives(sidePerspectives?.sides);
  }, [sidePerspectives]);

  return (
    <div className="h-screen grid w-full overflow-hidden">
      <div className="relative flex h-full">
        {/* Sidebar */}
        <aside className="min-w-[70px] bg-slate-900 border-r border-slate-800">
          <div className="flex overflow-auto flex-col">
            <div className="flex justify-start items-center flex-col mt-8">
              <button className="p-2 bg-slate-800 rounded-full text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            </div>

            <div className="justify-around items-center grid content-start mt-12">
              {filteredSidebarMenu?.map((menu, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center flex-col relative cursor-pointer pb-8"
                  onClick={() => handleMainPersClk(menu)}
                >
                  <img
                    src={menu?.isActivated ? menu?.activated_icon : menu?.icon}
                    alt="Menu item"
                    className="cursor-pointer"
                  />
                  <span className="text-[clamp(14px,0.8vw,16px)] font-medium capitalize mt-2 text-white">
                    {menu?.name}
                  </span>

                  {activeMenu.current === menu?.sideID && (
                    <div
                      className="absolute left-full ml-4 bg-gray-800 rounded-lg p-4 min-w-[200px] shadow-lg"
                      style={{ zIndex: 10000 }}
                    >
                      <div className="text-white">
                        <ul className="space-y-2">
                          {menu?.perpectives?.map((pers) => (
                            <li
                              key={pers}
                              onClick={() => handlePersClk(menu, pers)}
                              className="hover:bg-gray-700 p-2 rounded"
                            >
                              {pers}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div
            className="grid relative p-4 pb-0 h-full overflow-y-auto gap-y-3"
            style={{ gridTemplateRows: "max-content minmax(0, 1fr)" }}
          >
            {/* Top Controls */}

            <div className="w-full flex flex-row gap-x-[20px] justify-start">
              <div></div>
              <div
                className="grid gap-x-[4px] gap-y-[4px] w-[80%] grid-rows-2 p-[12px] min-h-max rounded-md bg-slate-800 text-white shadow-lg"
                style={{
                  backgroundColor: " rgb(44, 46, 49)",
                  color: "rgb(249, 249, 249)",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                }}
              >
                {containerMetaData.map((container, index) => (
                  <div
                    className="flex justify-evenly items-center gap-x-[5px]"
                    key={index}
                  >
                    <p className="m-0 w-[50%] leading-[1.2] text-[14px] font-sib capitalize opacity-[.8]">
                      {container?.label}
                    </p>
                    <p className="m-0 w-[10%] font-ib">:</p>
                    <p className="m-0 w-[40%] leading-[1.2] font-ib capitalize">
                      {container?.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-x-4">
                {/* Custom toggle switch for Minor Damages */}
                <div className="flex items-start flex-col w-max gap-y-4">
                  <p className="font-medium text-[clamp(14px,0.8vw,16px)]">
                    Minor Damages
                  </p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={sideToggleModel && !isNoMinorDamagePresent}
                      onChange={(e) => setSideToggleModel(e.target.checked)}
                      disabled={isNoMinorDamagePresent}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Custom toggle switch for HeatMap */}
                <div
                  className={`flex items-start flex-col w-max gap-y-4 ${
                    !getIsHeatMapImagePathEmpty ? "pointer-events-none" : ""
                  }`}
                >
                  <p className="font-medium text-[clamp(14px,0.8vw,16px)]">
                    HeatMap
                  </p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={heatMapToggleModel && getIsHeatMapImagePathEmpty}
                      onChange={(e) => setHeatMapToggleModel(e.target.checked)}
                      disabled={!getIsHeatMapImagePathEmpty}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Container Viewer */}
            {controlSetting ? (
              <div className="grid gap-y-5 h-full w-full bg-white">
                <div className="grid w-full max-h-full p-4 justify-center grid-cols-1 mx-auto shadow-lg shadow-zinc-300 rounded-xl">
                  {/* <div className="w-full h-full bg-slate-100 rounded-lg"></div> */}
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
                </div>

                <div className="w-full p-3 flex justify-start items-center overflow-x-auto">
                  {["Information", "Major Damage", "Minor Damage"].map(
                    (section, index) => (
                      <div key={index} className="w-1/3">
                        <div
                          className={`overflow-auto rounded-md p-4 h-[9dvh] ${
                            index === 0
                              ? "bg-gray-300"
                              : index === 1
                              ? "bg-red-200"
                              : "bg-yellow-200"
                          }`}
                        >
                          {section}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewDamage;
