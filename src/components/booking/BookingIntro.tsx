export function BookingIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <div className="mb-6 text-[13px] font-semibold text-ax-violet">Strategy session</div>
      <h1 className="mb-6 text-[length:var(--ax-fs-h1-fluid)] font-bold leading-tight tracking-tight">
        Let&apos;s map your revenue system.
      </h1>
      <p className="mx-auto mb-10 max-w-[56ch] text-base leading-relaxed text-ax-text-muted">
        Thirty minutes, no deck. We will look at your market, your current outbound approach, and what a qualified
        conversation should look like for you, then propose a scope. Five short steps, roughly three minutes.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-8 py-4 text-[15px] font-semibold text-white"
      >
        Start
      </button>
    </div>
  );
}
