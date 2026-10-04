/** Only a name supplied by the public RPC may appear in this ribbon. */
export function BrandRibbon({ name }: { name?: string | undefined }) {
  if (!name) return null;
  return (
    <aside className="brand-ribbon" aria-label={name}>
      <div className="brand-ribbon-track" aria-hidden="true">
        {[0, 1].map((copy) => (
          <span className="brand-ribbon-group" key={copy}>
            {[0, 1, 2, 3].map((item) => (
              <span key={item}>
                {name}
                <span className="mx-8">✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </aside>
  );
}
