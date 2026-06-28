import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: 'Cliente' | 'Cerrajero' | null;
  userData: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, userData: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'Cliente' | 'Cerrajero' | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Handle both legacy 'role' and new 'rol' field
            let userRole = data.rol 
              ? (data.rol === 'cerrajero' ? 'Cerrajero' : 'Cliente') 
              : data.role;
            setRole(userRole as 'Cliente' | 'Cerrajero');
            setUserData(data);
          } else {
            setRole(null);
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
          setUserData(null);
        }
      } else {
        setRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
