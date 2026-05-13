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
    <main className="game-backdrop min-h-svh overflow-x-hidden text-slate-800 lg:h-svh lg:overflow-hidden">
      <div className="mx-auto flex min-h-svh w-full max-w-[1500px] flex-col px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-3 lg:h-svh lg:px-5 lg:pb-2">
        {header}
        {notice}
        <div className="grid flex-1 grid-cols-1 gap-3 py-3 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_330px] lg:grid-rows-1 lg:items-stretch xl:grid-cols-[minmax(0,1fr)_350px]">
          <section className="min-w-0 lg:min-h-0">{factory}</section>
          <aside className="min-w-0 lg:min-h-0 lg:overflow-hidden">{upgrades}</aside>
        </div>
      </div>
    </main>
  );
}
