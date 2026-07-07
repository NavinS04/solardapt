export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="relative bg-bg-0 pt-32">
      <div className="container max-w-3xl pb-24">
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        {/* TEMPLATE ONLY — must be reviewed by a qualified lawyer before launch
            (BUILD_SPEC §10). */}
        <div className="mt-4 rounded-md border border-warn/30 bg-warn/10 p-4 text-sm text-muted-foreground">
          <strong className="text-warn">Template notice:</strong> This document is a starting
          template and must be reviewed and adapted by a qualified lawyer before publication.
        </div>
        <div className="prose-legal mt-8 space-y-6 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_a]:text-solar-400 [&_a]:underline">
          {children}
        </div>
      </div>
    </article>
  );
}
