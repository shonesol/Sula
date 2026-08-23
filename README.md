# Chichi Safaris – Website with Admin Uploads

Static site with an admin panel.

- **Photos & videos** → stored on **Cloudinary**
- **Itineraries** → stored in **Firestore** (Firebase)
- Public site loads both dynamically

## Project structure

```
├── index.html              # Public website
├── admin.html              # Admin login + upload panel
├── styles.css              # Shared styles
├── firebase.json           # Firebase Hosting config (optional)
├── js/
│   ├── firebase-config.js  # ← ONLY FILE YOU NEED TO EDIT
│   ├── app.js              # Public site logic
│   └── admin.js            # Admin panel logic
└── README.md
```

## Setup (required before uploads work)

### 1. Edit the config file

Open **`js/firebase-config.js`** and replace the placeholders:

```js
export const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

export const cloudinaryConfig = {
  cloudName: "your_cloud_name",
  uploadPreset: "your_unsigned_preset",
  itineraryFolder: "chichi-safaris/itineraries",
  galleryFolder: "chichi-safaris/gallery"
};
```

### 2. Firebase

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** → Sign-in method → **Email/Password**
3. Create a user (this is your admin login)
4. Create a **Firestore** database
5. Register a Web app and copy the config into `js/firebase-config.js`
6. Set these Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /itineraries/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /gallery/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Cloudinary

1. Sign up at https://cloudinary.com
2. Copy your **Cloud name** from the dashboard
3. Settings → Upload → Upload presets → Add upload preset
   - Signing mode: **Unsigned**
4. Put cloud name + preset name into `js/firebase-config.js`

### 4. Run locally

```bash
npx serve .
# or
python3 -m http.server 8080
```

- Website: http://localhost:8080  
- Admin:   http://localhost:8080/admin.html  

## How uploads work

| Content        | Storage                          | Shown on          |
|----------------|----------------------------------|-------------------|
| Safari itinerary | Firestore `itineraries` + cover image on Cloudinary | #safaris section |
| Photos / Videos  | Cloudinary + metadata in Firestore `gallery`       | #gallery section |

If Firestore is empty (or config still has placeholders), the site shows the original static fallback content.
