import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fallback = [
  "https://images.unsplash.com/photo-1552410260-0fd9b577afa6?w=800",
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
  "https://images.unsplash.com/photo-1549366021-9f762d4d2b9c?w=800",
  "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800",
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
];

async function loadGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      grid.innerHTML = fallback
        .map((url) => `<div class="gallery-item" style="background-image:url('${url}')"></div>`)
        .join("");
      return;
    }
    grid.innerHTML = "";
    snap.forEach((d) => {
      const data = d.data();
      const el = document.createElement("div");
      el.className = "gallery-item";
      if (data.type === "video") {
        el.innerHTML = `<video src="${data.url}" muted loop playsinline autoplay></video>`;
      } else {
        el.style.backgroundImage = `url('${data.url}')`;
      }
      grid.appendChild(el);
    });
  } catch {
    grid.innerHTML = fallback
      .map((url) => `<div class="gallery-item" style="background-image:url('${url}')"></div>`)
      .join("");
  }
}
loadGallery();
