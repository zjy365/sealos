import urls from '@/utils/urls';
import { useEffect } from 'react';

export default function useScene(sceneKey: keyof typeof urls.scenes, callback: () => void) {
  useEffect(() => {
    const scene = urls.scenes[sceneKey];
    if (scene && location.hash === scene.hash) {
      callback();
    }
  }, [sceneKey]);
}
