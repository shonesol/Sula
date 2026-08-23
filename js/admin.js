// Admin panel – auth, Cloudinary uploads, Firestore writes
// Upload sections are always visible. Login is required to save.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { firebaseConfig, cloudinaryConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginStatus = document.getElementById("login-status");
const authStatusText = document.getElementById("auth-status-text");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const setupBanner = document.getElementById("setup-banner");

let currentUser = null;

function showStatus(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = "status " + type;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function isConfigPlaceholder() {
  return (
    !firebaseConfig.apiKey ||
    firebaseConfig.apiKey === "AIzaSyC8DBBtpGJZbZ4Pc-Sv1pd6agiMCFA8_nM" ||
    !cloudinaryConfig.cloudName ||
    cloudinaryConfig.cloudName === "ziudh5iv"
  );
}

// Show / hide setup banner
if (setupBanner) {
  if (isConfigPlaceholder()) {
    setupBanner.classList.remove("hidden");
  } else {
    setupBanner.classList.add("hidden");
  }
}

// ── Auth state (does NOT hide upload sections) ────────────────
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authStatusText.textContent = "Logged in as " + user.email;
    authStatusText.classList.add("logged-in");
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    document.getElementById("email").style.display = "none";
    document.getElementById("password").style.display = "none";
    document.querySelector('label[for="email"]')?.style && (document.querySelector('label[for="email"]').style.display = "none");
    document.querySelector('label[for="password"]')?.style && (document.querySelector('label[for="password"]').style.display = "none");
    loadManageLists();
  } else {
    authStatusText.textContent = "Not logged in — log in to save itineraries & gallery items.";
    authStatusText.classList.remove("logged-in");
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    document.getElementById("email").style.display = "";
    document.getElementById("password").style.display = "";
  }
});

// Login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isConfigPlaceholder()) {
    showStatus(loginStatus, "Add your Firebase keys in js/firebase-config.js first.", "error");
    return;
  }
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  showStatus(loginStatus, "Signing in…", "info");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showStatus(loginStatus, "Logged in successfully!", "success");
  } catch (err) {
    showStatus(loginStatus, err.message, "error");
  }
});

// Logout
logoutBtn?.addEventListener("click", () => signOut(auth));

// Tabs
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab)?.classList.add("active");
  });
});

// ── Cloudinary – Itinerary cover image ────────────────────────
let itineraryWidget = null;

function openItineraryUpload() {
  if (isConfigPlaceholder()) {
    alert("Please set your Cloudinary cloudName and uploadPreset in js/firebase-config.js first.");
    return;
  }
  if (!itineraryWidget) {
    itineraryWidget = cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        folder: cloudinaryConfig.itineraryFolder,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"]
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          const url = result.info.secure_url;
          document.getElementById("it-image-url").value = url;
          document.getElementById("it-image-preview").innerHTML =
            `<img src="${url}" alt="Preview" />`;
        }
      }
    );
  }
  itineraryWidget.open();
}

document.getElementById("upload-itinerary-image")?.addEventListener("click", openItineraryUpload);

// ── Save itinerary to Firestore → shows on #safaris ───────────
document.getElementById("itinerary-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById("itinerary-status");

  if (isConfigPlaceholder()) {
    showStatus(statusEl, "Add Firebase & Cloudinary keys in js/firebase-config.js first.", "error");
    return;
  }
  if (!currentUser) {
    showStatus(statusEl, "Please log in first (section 1 above).", "error");
    return;
  }

  const imageUrl = document.getElementById("it-image-url").value;
  if (!imageUrl) {
    showStatus(statusEl, "Please upload a cover image first.", "error");
    return;
  }

  const data = {
    title: document.getElementById("it-title").value.trim(),
    description: document.getElementById("it-description").value.trim(),
    duration: document.getElementById("it-duration").value.trim(),
    price: document.getElementById("it-price").value.trim(),
    imageUrl,
    createdAt: serverTimestamp()
  };

  showStatus(statusEl, "Saving to Firestore…", "info");
  try {
    await addDoc(collection(db, "itineraries"), data);
    showStatus(statusEl, "Saved! It now appears in the Safaris section on the public site.", "success");
    e.target.reset();
    document.getElementById("it-image-url").value = "";
    document.getElementById("it-image-preview").innerHTML = "";
    loadManageLists();
  } catch (err) {
    console.error(err);
    showStatus(statusEl, "Error: " + err.message, "error");
  }
});

// ── Cloudinary – Gallery photos & videos → #gallery ───────────
let galleryWidget = null;

function openGalleryUpload() {
  if (isConfigPlaceholder()) {
    alert("Please set your Cloudinary cloudName and uploadPreset in js/firebase-config.js first.");
    return;
  }
  if (!currentUser) {
    alert("Please log in first (section 1 above).");
    return;
  }
  if (!galleryWidget) {
    galleryWidget = cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        folder: cloudinaryConfig.galleryFolder,
        sources: ["local", "url", "camera"],
        multiple: true,
        maxFiles: 10,
        resourceType: "auto"
      },
      async (error, result) => {
        if (!error && result && result.event === "success") {
          const info = result.info;
          const isVideo = info.resource_type === "video";
          const url = info.secure_url;

          try {
            await addDoc(collection(db, "gallery"), {
              url,
              publicId: info.public_id,
              type: isVideo ? "video" : "image",
              width: info.width || null,
              height: info.height || null,
              createdAt: serverTimestamp()
            });
            showStatus(
              document.getElementById("media-status"),
              `${isVideo ? "Video" : "Image"} saved to Gallery section!`,
              "success"
            );
            const preview = document.getElementById("media-preview");
            if (isVideo) {
              preview.insertAdjacentHTML("beforeend", `<video src="${url}" controls muted></video>`);
            } else {
              preview.insertAdjacentHTML("beforeend", `<img src="${url}" alt="Uploaded" />`);
            }
            loadManageLists();
          } catch (err) {
            showStatus(
              document.getElementById("media-status"),
              "Firestore error: " + err.message,
              "error"
            );
          }
        }
      }
    );
  }
  galleryWidget.open();
}

document.getElementById("upload-gallery-media")?.addEventListener("click", openGalleryUpload);

// ── Manage lists ──────────────────────────────────────────────
async function loadManageLists() {
  if (!currentUser || isConfigPlaceholder()) return;

  const itList = document.getElementById("itineraries-list");
  if (itList) {
    try {
      const q = query(collection(db, "itineraries"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        itList.innerHTML = "<p style='opacity:0.6'>No itineraries yet.</p>";
      } else {
        itList.innerHTML = "";
        snap.forEach((d) => {
          const data = d.data();
          const row = document.createElement("div");
          row.className = "list-item";
          row.innerHTML = `
            <span><strong>${escapeHtml(data.title)}</strong> — ${escapeHtml(data.duration || "")} · ${escapeHtml(data.price || "")}</span>
            <button class="btn-danger" data-col="itineraries" data-id="${d.id}">Delete</button>
          `;
          itList.appendChild(row);
        });
      }
    } catch (err) {
      itList.innerHTML = `<p class="status error" style="display:block">Error: ${err.message}</p>`;
    }
  }

  const gList = document.getElementById("gallery-list");
  if (gList) {
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        gList.innerHTML = "<p style='opacity:0.6'>No gallery items yet.</p>";
      } else {
        gList.innerHTML = "";
        snap.forEach((d) => {
          const data = d.data();
          const row = document.createElement("div");
          row.className = "list-item";
          const thumb =
            data.type === "video"
              ? `<video src="${data.url}" style="width:48px;height:36px;object-fit:cover;border-radius:4px;" muted></video>`
              : `<img src="${data.url}" style="width:48px;height:36px;object-fit:cover;border-radius:4px;" alt="" />`;
          row.innerHTML = `
            <span style="display:flex;align-items:center;gap:0.6rem;">${thumb} ${data.type}</span>
            <button class="btn-danger" data-col="gallery" data-id="${d.id}">Delete</button>
          `;
          gList.appendChild(row);
        });
      }
    } catch (err) {
      gList.innerHTML = `<p class="status error" style="display:block">Error: ${err.message}</p>`;
    }
  }

  document.querySelectorAll(".btn-danger").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this item from the website?")) return;
      try {
        await deleteDoc(doc(db, btn.dataset.col, btn.dataset.id));
        loadManageLists();
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    });
  });
}
