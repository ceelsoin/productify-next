export default function CreditsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Credits</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-dark-border bg-dark-lighter p-6">
          <h2 className="mb-4 text-xl font-semibold">Current Balance</h2>
          <p className="mb-2 text-4xl font-bold text-primary">0 Credits</p>
          <p className="text-sm text-foreground/70">
            Purchase credits to start generating product media
          </p>
        </div>
        <div className="rounded-lg border border-dark-border bg-dark-lighter p-6">
          <h2 className="mb-4 text-xl font-semibold">Purchase Credits</h2>
          <p className="text-sm text-foreground/70">
            Stripe integration coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
