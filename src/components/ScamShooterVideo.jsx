import spritePlayer from "../assets/sprite_player1.png";

export function ScamShooterVideo() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl border border-brand-muted/30 bg-white/90 p-8 shadow-xl grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.2em] text-brand-muted uppercase">
            Scam Shooter Demo
          </p>
          <h2 className="text-3xl font-heading tracking-tight text-brand-text">
            Crypto made easy.
          </h2>
          <p className="text-brand-muted text-base leading-relaxed">
            Simplify complex crypto lessons into a fun, playable game. Watch the demo to see how lessons and missions blend together.
          </p>
          <div className="flex items-center gap-3 text-sm text-brand-muted">
            <img src={spritePlayer} alt="Scam Shooter hero" className="h-10 w-10" />
            <span>Scam Shooter arcade + lesson flow preview</span>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden border border-brand-muted/40 shadow-lg">
          <div className="aspect-video w-full">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/gfQsXYE86HU"
              title="Scam Shooter Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
