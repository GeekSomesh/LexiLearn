import React, { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const AuthButtons: React.FC = () => {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } =
    useAuth0();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (isLoading) return null;

  const initials = (() => {
    const name = user?.name || user?.email || "";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  return (
    <div className="relative" ref={ref}>
      {isAuthenticated ? (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            title={user?.email}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-md focus:outline-none ring-2 ring-white"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name || user.email}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="font-semibold">{initials}</span>
            )}
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
              <div className="px-3 py-2 text-sm text-gray-700">
                <div className="font-semibold truncate">{user?.name || user?.email}</div>
                <div className="text-xs text-gray-500">Signed in</div>
              </div>
              <div className="border-t" />
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={() => loginWithRedirect()}
            className="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-white rounded text-sm shadow"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthButtons;
