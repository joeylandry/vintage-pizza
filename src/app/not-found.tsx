import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-tomato">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide">This slice is missing</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/order" className="mt-6 inline-flex h-12 items-center rounded-full bg-tomato px-6 font-semibold text-white hover:bg-tomato-dark">
        See the menu
      </Link>
    </div>
  );
}
