// ============================================================
//  Chichi Safaris – Firebase & Cloudinary configuration
//  FILL IN YOUR REAL VALUES BELOW (only file you need to edit)
// ============================================================

// ── Firebase (from Firebase Console → Project settings → Your apps)
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ── Cloudinary (Dashboard → Cloud name + unsigned upload preset)
export const cloudinaryConfig = {
  cloudName: "ziudh5iv",
  uploadPreset: "chichi_gallery",
  itineraryFolder: "chichi/itineraries",
  galleryFolder: "chichi/gallery"
};
