"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useQuizStore } from "@/lib/store";
import { useAuth } from "./AuthProvider";

export default function Nav() {
  const pathname = usePathname();
  const profile = useQuizStore((s) => s.profile);
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isQuiz = pathname.startsWith("/quiz");

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isQuiz) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isQuiz]);

  if (isQuiz) return null;

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? user?.email;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-gray-900 hover:opacity-80 transition-opacity"
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{ background: "#1D9E75" }}
          >
            ND
          </span>
          <span className="text-base tracking-tight hidden sm:block">No Destination</span>
        </Link>

        {/* Right side */}
        <nav className="flex items-center gap-1">
          <Link
            href="/group"
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Group trips
          </Link>
          {profile && (
            <>
              <Link
                href="/results"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                My Matches
              </Link>
              <Link
                href="/profile"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Profile
              </Link>
            </>
          )}

          {!loading && (
            <>
              {user ? (
                /* ── Signed-in: avatar + dropdown ── */
                <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName ?? ""}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    ) : (
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: "#1D9E75" }}
                      >
                        {displayName?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {displayName}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.user_metadata?.full_name ?? "Traveler"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        My profile
                      </Link>
                      <Link
                        href="/results"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        My matches
                      </Link>
                      <Link
                        href="/group"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Group trips
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { signOut(); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Signed-out: sign in + quiz ── */
                <>
                  <button
                    onClick={() => signInWithGoogle()}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign in
                  </button>
                  <Link
                    href="/quiz"
                    className="ml-1 px-4 py-1.5 text-sm font-semibold text-white rounded-full transition-all hover:opacity-90 active:scale-95"
                    style={{ background: "#1D9E75" }}
                  >
                    {profile ? "Retake quiz" : "Take the quiz"}
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
