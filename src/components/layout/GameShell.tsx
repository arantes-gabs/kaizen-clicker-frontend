import type { ReactNode } from "react";

interface GameShellProps {
  header: ReactNode;
  notice?: ReactNode;
  upgrades: ReactNode;
  factory: ReactNode;
}

export function GameShell({
  header,
  notice,
  upgrades,
  factory,
}: GameShellProps) {
  return (
    <main className="game-backdrop h-svh overflow-hidden text-slate-800">
      <div className="mx-auto flex h-svh w-full max-w-[1500px] flex-col px-2 py-2 sm:px-3 lg:px-5">
        {header}
        {notice}
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(190px,34svh)] gap-3 py-3 lg:grid-cols-[minmax(0,1fr)_330px] lg:grid-rows-1 lg:items-stretch xl:grid-cols-[minmax(0,1fr)_350px]">
          <section className="min-h-0 min-w-0">{factory}</section>
          <aside className="min-h-0 overflow-hidden">{upgrades}</aside>
        </div>
      </div>
    </main>
  );
}
