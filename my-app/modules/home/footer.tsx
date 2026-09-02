import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";

export function Footer() {
  const socialLinks = [
    {
      href: "https://github.com/Vishal-git123",
      icon: (
        <SiGithub className="w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" />
      ),
    },
  ];

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col items-center space-y-6 text-center">
        <div className="flex gap-4">
          {socialLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.icon}
            </Link>
          ))}
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          &copy; 2026 Codesnippet. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
