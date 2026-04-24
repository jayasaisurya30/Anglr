import Link from "next/link";
import { Logo } from "@/components/common/logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <span className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ANGLR
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/public/feed" className="hover:text-foreground">
            Public feed
          </Link>
          <Link href="/public/map" className="hover:text-foreground">
            Public map
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
