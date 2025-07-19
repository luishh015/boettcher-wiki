function suche() {
  const eingabe = document.getElementById("frage").value.toLowerCase();
  const treffer = daten.find(d => eingabe.includes(d.frage.toLowerCase()));
  const ausgabe = document.getElementById("antwort");

  if (treffer) {
    ausgabe.innerHTML = `<p>${treffer.antwort}</p>`;
  } else {
    ausgabe.textContent = "Keine passende Antwort gefunden.";
  }
}

// Admin-Login zeigen
function zeigeLogin() {
  document.getElementById("admin-login").style.display = "none";
  document.getElementById("admin-panel").style.display = "block";
}

// Admin-Passwort prüfen
function authAdmin() {
  const pass = document.getElementById("admin-passwort").value;
  if (pass === "admin") {
    document.getElementById("admin-funktion").style.display = "block";
    ladeFragen();
  } else {
    alert("Falsches Passwort");
  }
}

// Neuen Eintrag hinzufügen
function eintragHinzufuegen() {
  const frage = document.getElementById("neueFrage").value.trim();
  const antwort = document.getElementById("neueAntwort").value.trim();
  if (frage && antwort) {
    daten.push({ frage, antwort });
    localStorage.setItem("faqDaten", JSON.stringify(daten));
    ladeFragen();
    document.getElementById("neueFrage").value = "";
    document.getElementById("neueAntwort").value = "";
  }
}

// Fragen/Antworten anzeigen
function ladeFragen() {
  const liste = document.getElementById("faq-liste");
  liste.innerHTML = "";
  daten.forEach((eintrag, i) => {
    const li = document.createElement("li");
    li.textContent = `❓ ${eintrag.frage} → 💡 ${eintrag.antwort}`;
    liste.appendChild(li);
  });
}
