import { useEffect, useRef } from 'react';
import SoundPlayer from 'react-native-sound-player';

const SoundManager = ({ onNewBarcode }) => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    if (onNewBarcode) {
      playBeepSound();
    }
  }, [onNewBarcode]);

  const playBeepSound = () => {
    try {
      SoundPlayer.playSoundFile('good_read', 'wav');
    } catch (error) {
      console.log('Failed to play beep sound:', error);
      // Fallback: try playing without extension
      try {
        SoundPlayer.playSoundFile('beep', '');
        console.log('Beep sound played successfully (fallback)');
      } catch (fallbackError) {
        console.log('Failed to play beep sound (fallback):', fallbackError);
      }
    }
  };

  // This component doesn't render anything
  return null;
};

export default SoundManager;
