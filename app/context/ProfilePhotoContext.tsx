import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTO_KEY = 'profile_photo_uri';

type ProfilePhotoContextType = {
  photoUri: string | null;
  setPhotoUri: (uri: string | null) => void;
};

const ProfilePhotoContext = createContext<ProfilePhotoContextType>({
  photoUri: null,
  setPhotoUri: () => {},
});

export function ProfilePhotoProvider({ children }: { children: ReactNode }) {
  const [photoUri, setUri] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PHOTO_KEY).then((val) => {
      if (val) setUri(val);
    });
  }, []);

  function setPhotoUri(uri: string | null) {
    setUri(uri);
    if (uri) {
      AsyncStorage.setItem(PHOTO_KEY, uri);
    } else {
      AsyncStorage.removeItem(PHOTO_KEY);
    }
  }

  return (
    <ProfilePhotoContext.Provider value={{ photoUri, setPhotoUri }}>
      {children}
    </ProfilePhotoContext.Provider>
  );
}

export const useProfilePhoto = () => useContext(ProfilePhotoContext);
