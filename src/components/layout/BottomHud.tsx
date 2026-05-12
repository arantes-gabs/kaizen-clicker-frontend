import { Button } from '../ui/Button'

const navItems = ['Factory', 'Modules', 'Goals'] as const

export function BottomHud() {
  return (
    <footer className="shrink-0 rounded-[1.4rem] border-2 border-white bg-white/70 p-1.5 shadow-[0_5px_0_rgba(148,163,184,0.12)] backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <nav className="grid grid-cols-3 gap-2" aria-label="Game sections">
          {navItems.map((item) => (
            <Button key={item} variant="ghost" size="sm" isActive={item === 'Factory'}>
              {item}
            </Button>
          ))}
        </nav>
        <div className="grid grid-cols-3 gap-2 text-center text-[0.65rem] font-black uppercase text-slate-500">
          <span className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5">
            Shift 01
          </span>
          <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
            Saved
          </span>
          <span className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
            Cozy
          </span>
        </div>
      </div>
    </footer>
  )
}
