declare const google: any;
declare const gapi: any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '973392524263-boe0vsvn8ovf0pfsiio6l69dbv95qhb2.apps.googleusercontent.com';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyC_EzzGdMLhRkVcuWg-APJGeORgCI8Mqv8';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

let accessToken: string | null = null;
let pickerApiLoaded = false;

// Load the Google Picker API
export const loadPickerApi = () => {
  return new Promise<void>((resolve) => {
    gapi.load('picker', () => {
      pickerApiLoaded = true;
      resolve();
    });
  });
};

// Get OAuth token
export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (accessToken) {
      resolve(accessToken);
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            accessToken = response.access_token;
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to get access token: ' + (response.error || 'Unknown error')));
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      reject(error);
    }
  });
};

export interface PickerResult {
  id: string;
  name: string;
  url: string;
  downloadUrl: string;
  thumbnailUrl: string;
}

export const openPicker = async (): Promise<PickerResult | null> => {
  if (!API_KEY || !CLIENT_ID) {
    throw new Error('Google API Key and Client ID are required. Please configure them in the Secrets panel.');
  }

  if (!pickerApiLoaded) {
    await loadPickerApi();
  }

  const token = await getAccessToken();

  return new Promise((resolve) => {
    const pickerCallback = (data: any) => {
      if (data.action === google.picker.Action.PICKED) {
        const doc = data.docs[0];
        // We need the direct URL for <img> tags. 
        // For Drive files, the direct URL often needs special handling or we use the webContentLink
        // doc.id is the file ID.
        resolve({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          downloadUrl: `https://drive.google.com/uc?export=view&id=${doc.id}`,
          thumbnailUrl: doc.thumbnails?.[0]?.url || ''
        });
      } else if (data.action === google.picker.Action.CANCEL) {
        resolve(null);
      }
    };

    const view = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES);
    view.setIncludeFolders(true);

    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(CLIENT_ID)
      .setOAuthToken(token)
      .addView(view)
      .setDeveloperKey(API_KEY)
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);
  });
};

/**
 * Converts a Google Drive share link to a direct link that works in <img> tags.
 * Note: This only works effectively if the file is shared as "Anyone with the link can view".
 */
export const convertDriveLink = (link: string): string => {
  if (!link) return '';
  
  // Extract file ID from various Drive link formats
  const idMatch = link.match(/[-\w]{25,}/);
  if (!idMatch) return link;
  
  const fileId = idMatch[0];
  
  // Option 1: The uc?id= format (most common for direct viewing)
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};
