import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image
            src="/icons/logo.png"
            alt="logo"
            width={24}
            height={24}
            unoptimized
          />
          <p>DevEvent</p>
        </Link>
        <ul>
          <li className="list-none"><Link href="/">Home</Link></li>
          <li className="list-none"><Link href="/">Events</Link></li>
          <li className="list-none"><Link href="/">Create Event</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
