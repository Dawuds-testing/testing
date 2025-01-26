/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import {
  Config,
  Resolution,
  SortBy,
  Quality,
  VisualTag,
  AudioTag,
  Encode,
  ServiceDetail,
  ServiceCredential,
} from '@aiostreams/types';
import SortableCardList from '../../components/SortableCardList';
import ServiceInput from '../../components/ServiceInput';
import AddonsList from '../../components/AddonsList';
import { Slide, ToastContainer, ToastOptions, toast } from 'react-toastify';
import addonPackage from '../../../package.json';
import { formatSize } from '@aiostreams/formatters';
import {
  allowedFormatters,
  allowedLanguages,
  validateConfig,
} from '@aiostreams/config';
import { addonDetails, serviceDetails, Settings } from '@aiostreams/utils';

import Slider from '@/components/Slider';
import CredentialInput from '@/components/CredentialInput';
import MultiSelect from '@/components/MutliSelect';

const version = addonPackage.version;

const defaultQualities: Quality[] = [
  { 'BluRay REMUX': true },
  { BluRay: true },
  { 'WEB-DL': true },
  { WEBRip: true },
  { HDRip: true },
  { 'HC HD-Rip': true },
  { DVDRip: true },
  { HDTV: true },
  { CAM: true },
  { TS: true },
  { TC: true },
  { SCR: true },
  { Unknown: true },
];

const defaultVisualTags: VisualTag[] = [
  { 'HDR+DV': true },
  { 'HDR10+': true },
  { HDR10: true },
  { HDR: true },
  { DV: true },
  { '3D': true },
  { IMAX: true },
  { AI: true },
];

const defaultAudioTags: AudioTag[] = [
  { Atmos: true },
  { 'DD+': true },
  { DD: true },
  { 'DTS-HD MA': true },
  { 'DTS-HD': true },
  { DTS: true },
  { TrueHD: true },
  { '5.1': true },
  { '7.1': true },
  { AC3: true },
  { AAC: true },
];

const defaultEncodes: Encode[] = [
  { AV1: true },
  { HEVC: true },
  { AVC: true },
  { 'H-OU': true },
  { 'H-SBS': true },
  { Unknown: true },
];

const defaultSortCriteria: SortBy[] = [
  { cached: true, direction: 'desc' },
  { resolution: true },
  { language: true },
  { size: true, direction: 'desc' },
  { visualTag: false },
  { service: false },
  { audioTag: false },
  { encode: false },
  { quality: false },
  { seeders: false, direction: 'desc' },
  { addon: false },
];

const toastOptions: ToastOptions = {
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: 'touch',
  style: {
    borderRadius: '8px',
    backgroundColor: '#ededed',
    color: 'black',
  },
};

function showToast(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning',
  id?: string
) {
  toast[type](message, {
    ...toastOptions,
    toastId: id,
  });
}

const defaultResolutions: Resolution[] = [
  { '2160p': true },
  { '1080p': true },
  { '720p': true },
  { '480p': true },
  { Unknown: true },
];

const defaultServices = serviceDetails.map((service) => ({
  name: service.name,
  id: service.id,
  enabled: false,
  credentials: {},
}));

export default function Configure() {
  const [formatterOptions, setFormatterOptions] = useState<string[]>(
    allowedFormatters.filter((f) => f !== 'imposter')
  );
  const [resolutions, setResolutions] =
    useState<Resolution[]>(defaultResolutions);
  const [qualities, setQualities] = useState<Quality[]>(defaultQualities);
  const [visualTags, setVisualTags] = useState<VisualTag[]>(defaultVisualTags);
  const [audioTags, setAudioTags] = useState<AudioTag[]>(defaultAudioTags);
  const [encodes, setEncodes] = useState<Encode[]>(defaultEncodes);
  const [sortCriteria, setSortCriteria] =
    useState<SortBy[]>(defaultSortCriteria);
  const [formatter, setFormatter] = useState<string>();
  const [services, setServices] = useState<Config['services']>(defaultServices);
  const [onlyShowCachedStreams, setOnlyShowCachedStreams] =
    useState<boolean>(false);
  const [prioritisedLanguages, setPrioritisedLanguages] = useState<
    string[] | null
  >(null);
  const [excludedLanguages, setExcludedLanguages] = useState<string[] | null>(
    null
  );
  const [addons, setAddons] = useState<Config['addons']>([]);
  const [maxMovieSize, setMaxMovieSize] = useState<number | null>(null);
  const [minMovieSize, setMinMovieSize] = useState<number | null>(null);
  const [maxEpisodeSize, setMaxEpisodeSize] = useState<number | null>(null);
  const [minEpisodeSize, setMinEpisodeSize] = useState<number | null>(null);
  const [addonNameInDescription, setAddonNameInDescription] =
    useState<boolean>(false);
  const [cleanResults, setCleanResults] = useState<boolean>(false);
  const [maxResultsPerResolution, setMaxResultsPerResolution] = useState<
    number | null
  >(null);
  const [mediaFlowEnabled, setMediaFlowEnabled] = useState<boolean>(false);
  const [mediaFlowProxyUrl, setMediaFlowProxyUrl] = useState<string>('');
  const [mediaFlowApiPassword, setMediaFlowApiPassword] = useState<string>('');
  const [mediaFlowPublicIp, setMediaFlowPublicIp] = useState<string>('');
  const [mediaFlowProxiedAddons, setMediaFlowProxiedAddons] = useState<
    string[] | null
  >(null);
  const [mediaFlowProxiedServices, setMediaFlowProxiedServices] = useState<
    string[] | null
  >(null);
  const [disableButtons, setDisableButtons] = useState<boolean>(false);
  const [manualManifestUrl, setManualManifestUrl] = useState<string | null>(
    null
  );

const getChoosableAddons = () => {
    return addonDetails.map((addon) => addon.id);
  };

  const createConfig = (): Config => {
    return {
      resolutions,
      qualities,
      visualTags,
      audioTags,
      encodes,
      sortBy: sortCriteria,
      onlyShowCachedStreams,
      prioritisedLanguages,
      excludedLanguages,
      maxMovieSize,
      minMovieSize,
      maxEpisodeSize,
      minEpisodeSize,
      addonNameInDescription,
      cleanResults,
      maxResultsPerResolution,
      formatter: formatter || 'gdrive',
      mediaFlowConfig: {
        mediaFlowEnabled,
        proxyUrl: mediaFlowProxyUrl,
        apiPassword: mediaFlowApiPassword,
        publicIp: mediaFlowPublicIp,
        proxiedAddons: mediaFlowProxiedAddons,
        proxiedServices: mediaFlowProxiedServices,
      },
      addons,
      services,
    };
  };

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit | undefined,
    timeoutMs = 5000
  ) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      console.log('Fetching', url, `with data: ${options?.body}`);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch {
      console.log('Clearing timeout');
      return clearTimeout(timeout);
    }
  };

  const getManifestUrl = async (
    protocol = window.location.protocol,
    root = window.location.host
  ) => {
    const config = createConfig();
    console.log('Config', config);
    setDisableButtons(true);

    try {
      const encryptPath = `/encrypt-user-data`;
      const response = await fetchWithTimeout(encryptPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: JSON.stringify(config) }),
      });
      if (!response) {
        throw new Error('encrypt-user-data failed: no response within timeout');
      }

      if (!response.ok) {
        throw new Error(
          `encrypt-user-data failed with status ${response.status} and statusText ${response.statusText}`
        );
      }

      const data = await response.json();
      if (!data.success) {
        if (data.error) {
          return {
            success: false,
            manifest: null,
            message: data.error,
          };
        }
        throw new Error(`Encryption service failed, ${data.message}`);
      }

      const encryptedConfig = data.data;
      return {
        success: true,
        manifest: `${protocol}//${root}/${encryptedConfig}/manifest.json`,
      };
    } catch (error: any) {
      console.error(
        'Error during encryption:',
        error.message,
        '\nFalling back to base64 encoding'
      );
      try {
        const base64Config = btoa(JSON.stringify(config));
        return {
          success: true,
          manifest: `${protocol}//${root}/${base64Config}/manifest.json`,
        };
      } catch (base64Error: any) {
        console.error('Error during base64 encoding:', base64Error.message);
        return {
          success: false,
          manifest: null,
          message: 'Failed to encode config',
        };
      }
    }
  };

  const createAndValidateConfig = () => {
    const config = createConfig();

    const { valid, errorCode, errorMessage } = validateConfig(config);
    console.log('Config', config, 'was valid:', valid);
    if (!valid) {
      showToast(
        errorMessage || 'Invalid config',
        'error',
        errorCode || 'error'
      );
      return false;
    }
    return true;
  };

  const handleInstall = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (createAndValidateConfig()) {
      const id = toast.loading('Generating manifest URL...', {
        ...toastOptions,
        toastId: 'generatingManifestUrl',
      });
      const manifestUrl = await getManifestUrl();
      if (!manifestUrl.success || !manifestUrl.manifest) {
        setDisableButtons(false);
        toast.update(id, {
          render: manifestUrl.message || 'Failed to generate manifest URL',
          type: 'error',
          autoClose: 5000,
          isLoading: false,
        });
        return;
      }

      const stremioUrl = manifestUrl.manifest.replace(/^https?/, 'stremio');

      try {
        const wp = window.open(stremioUrl, '_blank');
        if (!wp) {
          throw new Error('Failed to open window');
        }
        toast.update(id, {
          render: 'Successfully generated manifest URL',
          type: 'success',
          autoClose: 5000,
          isLoading: false,
        });
        setManualManifestUrl(null);
      } catch (error) {
        console.error('Failed to open Stremio', error);
        toast.update(id, {
          render:
            'Failed to open Stremio with manifest URL. The link can be opened manually at the bottom of this page.',
          type: 'error',
          autoClose: 5000,
          isLoading: false,
        });
        setManualManifestUrl(stremioUrl);
      }
      setDisableButtons(false);
    }
  };

  const handleInstallToWeb = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (createAndValidateConfig()) {
      const id = toast.loading('Generating manifest URL...', toastOptions);
      const manifestUrl = await getManifestUrl();
      if (!manifestUrl.success || !manifestUrl.manifest) {
        toast.update(id, {
          render: manifestUrl.message || 'Failed to generate manifest URL',
          type: 'error',
          autoClose: 5000,
          isLoading: false,
        });
        setDisableButtons(false);
        return;
      }

      const encodedManifestUrl = encodeURIComponent(manifestUrl.manifest);

      try {
        const wp = window.open(
          `https://web.stremio.com/#/addons?addon=${encodedManifestUrl}`,
          '_blank'
        );
        if (!wp) {
          throw new Error('Failed to open window');
        }
        toast.update(id, {
          render: 'Successfully generated manifest URL and opened Stremio web',
          type: 'success',
          autoClose: 5000,
          isLoading: false,
        });
        setManualManifestUrl(null);
      } catch (error) {
        console.error('Failed to open Stremio web', error);
        toast.update(id, {
          render:
            'Failed to open Stremio web with manifest URL. The link can be opened manually at the bottom of this page.',
          type: 'error',
          autoClose: 5000,
          isLoading: false,
        });
        setManualManifestUrl(
          `https://web.stremio.com/#/addons?addon=${encodedManifestUrl}`
        );
      }
      setDisableButtons(false);
    }
  };


const handleCopyLink = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (createAndValidateConfig()) {
      const id = toast.loading('Generating manifest URL...', toastOptions);
      const manifestUrl = await getManifestUrl();
      if (!manifestUrl.success || !manifestUrl.manifest) {
        toast.update(id, {
          render: manifestUrl.message || 'Failed to generate manifest URL',
          type: 'error',
          autoClose: 5000,
          isLoading: false,
        });
        setDisableButtons(false);
        return;
      }

      // Fallback method for copying to clipboard
      const copyToClipboard = (text: string) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();

        try {
          const successful = document.execCommand("copy");
          if (successful) {
            toast.update(id, {
              render: 'Manifest URL copied to clipboard',
              type: 'success',
              autoClose: 5000,
              toastId: 'copiedManifestUrl',
              isLoading: false,
            });
            setManualManifestUrl(null);
          } else {
            throw new Error('Failed to copy text');
          }
        } catch (err) {
          console.error('Failed to copy manifest URL to clipboard', err);
          toast.update(id, {
            render:
              'Failed to copy manifest URL to clipboard. The link can be copied manually at the bottom of this page.',
            type: 'error',
            autoClose: 3000,
            isLoading: false,
          });
          setManualManifestUrl(manifestUrl.manifest);
        } finally {
          document.body.removeChild(textarea);
        }
      };

      // Try using navigator.clipboard first, then fallback to execCommand
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(manifestUrl.manifest)
          .then(() => {
            toast.update(id, {
              render: 'Manifest URL copied to clipboard',
              type: 'success',
              autoClose: 5000,
              toastId: 'copiedManifestUrl',
              isLoading: false,
            });
            setManualManifestUrl(null);
          })
          .catch((err: any) => {
            console.error('Failed to copy manifest URL to clipboard', err);
            // Fallback to execCommand if navigator.clipboard fails
            copyToClipboard(manifestUrl.manifest);
          });
      } else {
        // Use fallback method if navigator.clipboard is not available
        copyToClipboard(manifestUrl.manifest);
      }

      setDisableButtons(false);
    }
  };

  // Rest of the code remains unchanged...
  // (Include all other functions and JSX as provided in the original file)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Rest of the JSX remains unchanged... */}
      </div>
      <ToastContainer
        stacked
        position="top-center"
        transition={Slide}
        draggablePercent={30}
      />
    </div>
  );
}
