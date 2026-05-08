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
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(5,12,8,0.92)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="No Destination"
            width={500}
            height={140}
            className="object-contain"
            style={{ height: 120, width: "auto" }}
            priority
          />
        </Link>

        {/* Right side */}
        <nav className="flex items-center gap-1">
          <Link
            href="/group"
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Group trips
          </Link>
          {profile && (
            <>
              <Link
                href="/results"
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                My Matches
              </Link>
              <Link
                href="/profile"
                className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.55)" }}
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
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)" }}
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
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl py-1 z-50"
                      style={{ background: "#0d1a11", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-sm font-semibold text-white truncate">
                          {user.user_metadata?.full_name ?? "Traveler"}
                        </p>
                        <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{user.email}</p>
                      </div>
                      {[
                        { href: "/profile", label: "My profile" },
                        { href: "/results", label: "My matches" },
                        { href: "/group", label: "Group trips" },
                      ].map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm transition-colors"
                          style={{ color: "rgba(255,255,255,0.60)" }}
                        >
                          {label}
                        </Link>
                      ))}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="mt-1 pt-1">
                        <button
                          onClick={() => { signOut(); setDropdownOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm transition-colors"
                          style={{ color: "rgba(255,255,255,0.35)" }}
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
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
                    style={{ color: "rgba(255,255,255,0.55)" }}
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
