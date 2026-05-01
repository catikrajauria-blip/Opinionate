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
          downloadUrl: convertDriveLink(doc.url),
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

/**
 * Converts a Google Drive share link to a direct link that works in <img> tags.
 * Note: This only works effectively if the file is shared as "Anyone with the link can view".
 */
export const convertDriveLink = (link: string): string => {
  if (!link) return '';
  
  // If it's already a direct link we generated, return it
  if (link.includes('lh3.googleusercontent.com/d/') || link.includes('drive.google.com/thumbnail')) {
    // Ensure it has a size parameter if using lh3
    if (link.includes('lh3.googleusercontent.com/d/') && !link.includes('=')) {
      return `${link}=s1600`;
    }
    return link;
  }

  // Extract file ID from various Drive link formats
  // Handles: drive.google.com/file/d/ID/view, drive.google.com/open?id=ID, docs.google.com/viewer?id=ID
  const idMatch = link.match(/[-\w]{25,50}/);
  if (idMatch) {
    const fileId = idMatch[0];
    
    // Check if it's actually a Drive/Docs link or just a random ID-like string
    if (link.includes('drive.google.com') || link.includes('docs.google.com') || link.includes('googleusercontent.com')) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
    }
    
    // If it's just a raw ID (at least 25 chars), assume it's a Drive ID
    if (link.length >= 25 && !link.includes('/') && !link.includes('http')) {
      return `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
    }
  }
  
  return link;
};
