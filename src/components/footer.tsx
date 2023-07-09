import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 mt-4 flex w-full justify-center bg-slate-800 text-white">
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-2">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About Us</Link>
        </div>

        <div className="flex justify-center">
          <Link
            href="
            https://www.github.com/nichtLehdev"
            target="_blank"
          >
            <p className="text-center">© 2023 Lehdev</p>
          </Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
