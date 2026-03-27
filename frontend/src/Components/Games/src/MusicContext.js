import React, { createContext, useRef, useState, useEffect } from "react";
import bounceMusic from '../../../Assests/Bounce.mp3';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(new Audio(bounceMusic));
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    audioRef.current.play().catch(() => console.log("Autoplay blocked"));

    // Do NOT pause on unmount, music persists across pages
  }, []);

  const toggleMusic = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <MusicContext.Provider value={{ isPlaying, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};
