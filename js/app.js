// Public site – load itineraries & gallery from Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function getFallbackSafaris() {
  return `
    <article class="card">
      <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800');"></div>
      <div class="card-body">
        <h3>Classic Serengeti</h3>
        <p>Witness the Great Migration and endless golden plains in Tanzania’s most iconic park.</p>
        <div class="card-meta"><span>7 Days</span><span class="price">From $2,850</span></div>
        <a href="booking.html" class="btn btn-outline-dark">Book Now</a>
      </div>
    </article>
    <article class="card">
      <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800');"></div>
      <div class="card-body">
        <h3>Ngorongoro Crater</h3>
        <p>Descend into the world’s largest intact caldera — a true natural amphitheatre of wildlife.</p>
        <div class="card-meta"><span>5 Days</span><span class="price">From $2,150</span></div>
        <a href="booking.html" class="btn btn-outline-dark">Book Now</a>
      </div>
    </article>
    <article class="card">
      <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800');"></div>
      <div class="card-body">
        <h3>Murchison Falls National Park</h3>
        <p>Giant baobabs, large elephant herds, and quieter, more intimate game viewing.</p>
        <div class="card-meta"><span>6 Days</span><span class="price">From $2,400</span></div>
        <a href="booking.html" class="btn btn-outline-dark">Book Now</a>
      </div>
    </article>
  `;
}

function getFallbackGallery() {
  return `
    <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1552410260-0fd9b577afa6?w=600');"></div>
    <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600');"></div>
    <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1549366021-9f762d4d2b9c?w=600');"></div>
    <div class="gallery-item" style="background-image: url('https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=600');"></div>
  `;
}

async function loadSafaris() {
  const container = document.getElementById("safaris-container");
  if (!container) return;

  try {
    const q = query(collection(db, "itineraries"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = getFallbackSafaris();
      return;
    }

    container.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-image" style="background-image: url('${data.imageUrl || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"}');"></div>
        <div class="card-body">
          <h3>${escapeHtml(data.title || "Safari")}</h3>
          <p>${escapeHtml(data.description || "")}</p>
          <div class="card-meta">
            <span>${escapeHtml(data.duration || "")}</span>
            <span class="price">${escapeHtml(data.price || "")}</span>
          </div>
          <a href="booking.html" class="btn btn-outline-dark">Book Now</a>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading safaris:", err);
    container.innerHTML = getFallbackSafaris();
  }
}

async function loadGallery() {
  const container = document.getElementById("gallery-container");
  if (!container) return;

  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = getFallbackGallery();
      return;
    }

    container.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const item = document.createElement("div");
      item.className = "gallery-item";

      if (data.type === "video") {
        item.innerHTML = `<video src="${data.url}" muted loop playsinline autoplay></video>`;
      } else {
        item.style.backgroundImage = `url('${data.url}')`;
      }
      container.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading gallery:", err);
    container.innerHTML = getFallbackGallery();
  }
}

// Contact form
document.getElementById("contact-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Thank you! Your enquiry has been received. We will contact you shortly.");
  e.target.reset();
});

// Init
loadSafaris();
loadGallery();
