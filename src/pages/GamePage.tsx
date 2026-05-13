import { FactoryStage } from "../components/factory/FactoryStage";
import { RankingPanel } from "../components/dashboard/RankingPanel";
import { GameHeader } from "../components/layout/GameHeader";
import { GameShell } from "../components/layout/GameShell";
import { UpgradesPanel } from "../components/upgrades/UpgradesPanel";
import { useGameLoop } from "../hooks/useGameLoop";
import { useGameStore } from "../store/useGameStore";

export function GamePage() {
  useGameLoop();

  return (
    <GameShell
      header={<ConnectedHeader />}
      notice={<IntegrityNotice />}
      upgrades={
        <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3">
          <UpgradesPanel />
          <RankingPanel />
        </div>
      }
      factory={<ConnectedFactory />}
    />
  );
}

function IntegrityNotice() {
  const integrityNotice = useGameStore((state) => state.integrityNotice);
  const dismissIntegrityNotice = useGameStore(
    (state) => state.dismissIntegrityNotice,
  );

  if (!integrityNotice) {
    return null;
  }

  return (
    <div
      className="mt-2 flex flex-col gap-2 rounded-[1.2rem] border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <span>{integrityNotice}</span>
      <button
        className="rounded-xl border border-red-200 bg-white px-3 py-1 text-xs font-black uppercase text-red-700"
        onClick={dismissIntegrityNotice}
        type="button"
      >
        Entendi
      </button>
    </div>
  );
}

function ConnectedHeader() {
  const points = useGameStore((state) => state.points);
  const productionPerSecond = useGameStore(
    (state) => state.productionPerSecond,
  );
  const isPaused = useGameStore((state) => state.isPaused);
  const togglePause = useGameStore((state) => state.togglePause);

  return (
    <GameHeader
      points={points}
      productionPerSecond={productionPerSecond}
      isPaused={isPaused}
      onTogglePause={togglePause}
    />
  );
}

function ConnectedFactory() {
  const points = useGameStore((state) => state.points);
  const productionPerSecond = useGameStore(
    (state) => state.productionPerSecond,
  );
  const clickPower = useGameStore((state) => state.clickPower);
  const factory = useGameStore((state) => state.factory);
  const isPaused = useGameStore((state) => state.isPaused);
  const metrics = useGameStore((state) => state.metrics);
  const history = useGameStore((state) => state.history);
  const clickFactory = useGameStore((state) => state.clickFactory);

  return (
    <FactoryStage
      points={points}
      productionPerSecond={productionPerSecond}
      clickPower={clickPower}
      factory={factory}
      isPaused={isPaused}
      metrics={metrics}
      history={history}
      purchasePulse={metrics.totalUpgrades}
      onClickFactory={clickFactory}
    />
  );
}
