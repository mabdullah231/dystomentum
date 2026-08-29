interface SplashScreenProps {
  progress?: number
}

export function SplashScreen({ progress = 0 }: SplashScreenProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0A0A0C] pt-11 text-[#E8E8EC]" aria-label="Dystomentum is starting">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-10 flex h-11 items-center justify-center border-b border-[#18181B] shadow-sm shadow-black/20 [-webkit-app-region:drag]">
        <div className="flex items-center gap-2">
          <img src="/branding/Icon.png" alt="" className="h-4 w-4 rounded-[3px] object-cover" aria-hidden="true" />
          <span className="text-[11px] font-bold tracking-[0.16em] text-[#E8E8EC]">DYSTOMENTUM</span>
        </div>
      </header>
      <div className="flex w-[calc(100%-48px)] max-w-[420px] flex-col items-center px-0 py-12">
        <img src="/branding/Primary.png" alt="" className="mb-[22px] h-14 w-14 rounded-full object-cover" aria-hidden="true" />
        <div className="text-center">
          <h1 className="m-0 text-[clamp(1.35rem,3vw,1.7rem)] font-extrabold leading-none tracking-[0.08em]">DYSTOMENTUM</h1>
          <p className="mt-3 text-[0.64rem] font-bold leading-tight tracking-[0.17em] text-[#5A5A60]">OFFLINE-FIRST PERSONAL TRACKER</p>
        </div>
        <div className="mt-[42px] w-full">
          <div className="h-0.5 overflow-hidden bg-[#1F1F22]" role="progressbar" aria-label="Loading" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-0 animate-splash-fill bg-[#9A9AA0]" style={progress > 0 ? { width: `${progress}%` } : undefined} />
          </div>
          <span className="mt-3 block text-center text-[0.72rem] font-normal text-[#5A5A60]">Initializing local workspace…</span>
        </div>
      </div>
    </main>
  )
}
