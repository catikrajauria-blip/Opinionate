import { convertDriveLink } from './utils';

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
          downloadUrl: convertDriveLink(doc.id),
          thumbnailUrl: doc.thumbnails?.[0]?.url || ''
        });
      } else if (data.action === google.picker.Action.CANCEL) {
        resolve(null);
      }
    };

    // View 1: A flat list of all images in the entire Drive (no folders)
    const imagesView = new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES);
    imagesView.setIncludeFolders(false);

    // View 2: Traditional My Drive navigation but filtered to images
    const driveView = new google.picker.DocsView(google.picker.ViewId.DOCS);
    driveView.setMimeTypes('image/png,image/jpeg,image/jpg,image/webp');
    driveView.setIncludeFolders(true);

    // View 3: Direct upload tab
    const uploadView = new google.picker.DocsUploadView();

    const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setAppId(CLIENT_ID)
      .setOAuthToken(token)
      .addView(imagesView) // Shows ALL images flattened
      .addView(driveView)  // Shows folders if you need them
      .addView(uploadView) // Allows uploading new files
      .setDeveloperKey(API_KEY)
      .setCallback(pickerCallback)
      .setTitle('Select Post Image')
      .build();

    picker.setVisible(true);
  });
};

export { convertDriveLink };
