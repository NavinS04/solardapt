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
        <div className="prose-legal mt-8 space-y-6 text-muted-foreground [&_a]:text-solar-400 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_table]:w-full [&_table]:table-fixed [&_table]:text-sm [&_td]:break-words [&_td]:hyphens-auto [&_th]:break-words [&_td]:border-t [&_td]:border-border [&_td]:py-2.5 [&_td]:pr-4 [&_td]:align-top [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_ul]:space-y-2">
          {children}
        </div>
      </div>
    </article>
  );
}
