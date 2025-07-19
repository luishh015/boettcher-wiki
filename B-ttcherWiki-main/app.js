function suche() {
  const eingabe = document.getElementById("frage").value.toLowerCase();
  const treffer = daten.find(d => eingabe.includes(d.rolle));
  const ausgabe = document.getElementById("antwort");

  if (treffer) {
    ausgabe.innerHTML = `
      <p><strong>${treffer.name}</strong> – Durchwahl: ${treffer.durchwahl}</p>
      <p><a href="mailto:${treffer.email}">E-Mail senden</a></p>
      <p><a href="https://teams.microsoft.com/l/chat/0/0?users=${treffer.email}" target="_blank">Teams-Chat starten</a></p>
    `;
  } else {
    ausgabe.textContent = "Keine passende Zuständigkeit gefunden.";
  }
}
