import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  role: 'Cliente' | 'Cerrajero' | null;
  userData: any | null;
  loading: boolean;
  isRepairingLocation: boolean;
  repairLocationStatus: string;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, userData: null, loading: true, isRepairingLocation: false, repairLocationStatus: 'No' });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'Cliente' | 'Cerrajero' | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRepairingLocation, setIsRepairingLocation] = useState(false);
  const [repairLocationStatus, setRepairLocationStatus] = useState('No');
  
  // Ref to ensure repair runs only once per user session
  const repairAttemptedForUid = useRef<string | null>(null);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Independent location repair logic as requested
        if (repairAttemptedForUid.current !== currentUser.uid) {
          repairAttemptedForUid.current = currentUser.uid;
          
          try {
            const initialDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
            if (initialDoc.exists()) {
              const d = initialDoc.data();
              if (d.lat === undefined || d.lat === null || d.lng === undefined || d.lng === null || d.lat === 0 || d.lng === 0) {
                setIsRepairingLocation(true);
                setRepairLocationStatus('Sí...');
                
                if ('geolocation' in navigator) {
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      try {
                        await updateDoc(doc(db, 'usuarios', currentUser.uid), {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        });
                        setRepairLocationStatus('Completado');
                        setIsRepairingLocation(false);
                      } catch (err: any) {
                        setRepairLocationStatus(`Error BD: ${err.message}`);
                        setIsRepairingLocation(false);
                      }
                    },
                    (error) => {
                      setRepairLocationStatus(`Error GPS: ${error.message}`);
                      setIsRepairingLocation(false);
                    }
                  );
                } else {
                  setRepairLocationStatus('Error: GPS no soportado');
                  setIsRepairingLocation(false);
                }
              }
            }
          } catch (err: any) {
             setRepairLocationStatus(`Error leyendo doc: ${err.message}`);
          }
        }

        unsubscribeDoc = onSnapshot(doc(db, 'usuarios', currentUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            let userRole = data.rol 
              ? (data.rol === 'cerrajero' ? 'Cerrajero' : 'Cliente') 
              : data.role;
            setRole(userRole as 'Cliente' | 'Cerrajero');
            setUserData(data);
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
        repairAttemptedForUid.current = null;
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
    <AuthContext.Provider value={{ user, role, userData, loading, isRepairingLocation, repairLocationStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
