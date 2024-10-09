import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import WebsiteIcon from "../../../public/photos/websiteicon.png";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Members", href: "/members" },
  { name: "Posts", href: "/posts" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const router = useRouter();
  const { userName, userRole, logout } = useAuth();
  const [showSignOut, setShowSignOut] = useState(false);
  const signOutRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      signOutRef.current &&
      !signOutRef.current.contains(event.target as Node)
    ) {
      setShowSignOut(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-[open]:block"
              />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <Link href="/" className="flex flex-shrink-0 items-center">
              <Image
                alt="Humps Wiki"
                src={WebsiteIcon}
                className="h-8 w-auto"
              />
            </Link>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      router.pathname === item.href
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-lg font-bold"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {userRole !== "guest" && (
              <Link href="/createpost" passHref>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2"
                >
                  Create Post +
                </button>
              </Link>
            )}
            <div className="relative ml-4" ref={signOutRef}>
              <button
                type="button"
                onClick={() => setShowSignOut((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 hover:text-white font-bold px-4 py-2"
              >
                {userName || "User"}
              </button>
              {showSignOut && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                router.pathname === item.href
                  ? "bg-gray-900 text-white"
                  : "text-gray-300",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
