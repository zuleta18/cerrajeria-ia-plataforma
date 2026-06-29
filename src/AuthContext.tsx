import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: 'Cliente' | 'Cerrajero' | null;
  userData: any | null;
  loading: boolean;
  isRepairingLocation: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, userData: null, loading: true, isRepairingLocation: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'Cliente' | 'Cerrajero' | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRepairingLocation, setIsRepairingLocation] = useState(false);
  const hasPromptedLocation = useRef(false);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;
    
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        unsubscribeDoc = onSnapshot(doc(db, 'usuarios', currentUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            let userRole = data.rol 
              ? (data.rol === 'cerrajero' ? 'Cerrajero' : 'Cliente') 
              : data.role;
            setRole(userRole as 'Cliente' | 'Cerrajero');
            setUserData(data);

            // Auto-repair location
            if (!hasPromptedLocation.current && (!data.lat || !data.lng || data.lat === 0 || data.lng === 0)) {
              hasPromptedLocation.current = true;
              setIsRepairingLocation(true);
              if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    try {
                      await updateDoc(doc(db, 'usuarios', currentUser.uid), {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      });
                      console.log("Ubicación actualizada automáticamente.");
                    } catch (err) {
                      console.error("Error al actualizar la ubicación automáticamente:", err);
                    } finally {
                      setIsRepairingLocation(false);
                    }
                  },
                  (error) => {
                    console.error("No se pudo obtener la ubicación automáticamente:", error);
                    setIsRepairingLocation(false);
                    alert("Necesitamos tu ubicación para mostrarte cerrajeros cercanos. Por favor habilita el permiso de ubicación en tu navegador.");
                  }
                );
              } else {
                setIsRepairingLocation(false);
              }
            }

          } else {
            setRole(null);
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role:", error);
          setRole(null);
          setUserData(null);
          setLoading(false);
        });
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = undefined;
        }
        setRole(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, userData, loading, isRepairingLocation }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
