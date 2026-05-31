import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "smartspace_auth_session";

const DEMO_USERS = [
  {
    email: "buyer@smartspace.local",
    password: "User@123",
    role: "user",
    name: "Aarav Buyer",
  },
  {
    email: "admin@smartspace.local",
    password: "Admin@123",
    role: "admin",
    name: "Maya Admin",
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  function login(email, password) {
    const matchedUser = DEMO_USERS.find(
      (user) => user.email === email.trim().toLowerCase() && user.password === password,
    );

    if (!matchedUser) {
      throw new Error("Invalid credentials. Use one of the demo accounts shown below.");
    }

    const nextSession = {
      email: matchedUser.email,
      role: matchedUser.role,
      name: matchedUser.name,
    };
    setSession(nextSession);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    return nextSession;
  }

  function logout() {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
