import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Axieonex home">
      <Image
        src="/brand/axieonex-logo.png"
        alt="AXIEONEX Logo"
        width={399}
        height={154}
        priority
        className="h-9 w-auto sm:h-10"
      />
    </Link>
  );
}
