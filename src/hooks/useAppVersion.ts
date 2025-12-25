import { useState, useEffect } from 'react';
import { APP_VERSION } from '../constants';

export const useAppVersion = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<string | undefined>();

  useEffect(() => {
    const checkVersion = async () => {
      // Static version check
      setLatestVersion(APP_VERSION);
    };

    checkVersion();
  }, []);

  return { updateAvailable, latestVersion, forceUpdate, releaseNotes };
};

