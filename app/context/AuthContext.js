"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser } from "../service/firebase/auth";
import { syncUserAndLogSession } from "../service/firebase/firestore";

const AuthContext = createContext({
  user: null,
  loading: true,
  signin: async () => {},
  signout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        //Sync user doc & log session analytics
        await syncUserAndLogSession(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const signin = async () => {
    return await signInWithGoogle();
  };

  const signout = async () => {
    return await signOutUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);