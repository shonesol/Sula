import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

const fallbackHTML = `
  <article class="card">
    <div class="card-image" style="background-image:url('https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800')"></div>
    <div class="card-body">
      <h3>Classic Serengeti</h3>
      <p>Witness the Great Migration and endless golden plains in Tanzania’s most iconic park.</p>
      <div class="card-meta"><span>7 Days</span><span class="price">From $2,850</span></div>
      <a href="booking.html?safari=Classic%20Serengeti" class="btn btn-outline-dark">Book Now</a>
    </div>
  </article>
  <article class="card">
    <div class="card-image" style="background-image:url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800')"></div>
    <div class="card-body">
      <h3>Ngorongoro Crater</h3>
      <p>Descend into the world’s largest intact caldera — a true natural amphitheatre of wildlife.</p>
      <div class="card-meta"><span>5 Days</span><span class="price">From $2,150</span></div>
      <a href="booking.html?safari=Ngorongoro%20Crater" class="btn btn-outline-dark">Book Now</a>
    </div>
  </article>
  <article class="card">
    <div class="card-image" style="background-image:url('https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800')"></div>
    <div class="card-body">
      <h3>Murchison Falls National Park</h3>
      <p>Giant baobabs, large elephant herds, and quieter, more intimate game viewing in Uganda.</p>
      <div class="card-meta"><span>6 Days</span><span class="price">From $2,400</span></div>
      <a href="booking.html?safari=Murchison%20Falls" class="btn btn-outline-dark">Book Now</a>
    </div>
  </article>
`;

async function loadSafaris() {
  const container = document.getElementById("safaris-container");
  if (!container) return;
  try {
    const q = query(collection(db, "itineraries"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      container.innerHTML = fallbackHTML;
      return;
    }
    container.innerHTML = "";
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const title = data.title || "Safari";
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="card-image" style="background-image:url('${data.imageUrl || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"}')"></div>
        <div class="card-body">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(data.description || "")}</p>
          <div class="card-meta">
            <span>${escapeHtml(data.duration || "")}</span>
            <span class="price">${escapeHtml(data.price || "")}</span>
          </div>
          <a href="booking.html?safari=${encodeURIComponent(title)}" class="btn btn-outline-dark">Book Now</a>
        </div>`;
      container.appendChild(card);
    });
  } catch {
    container.innerHTML = fallbackHTML;
  }
}
loadSafaris();
