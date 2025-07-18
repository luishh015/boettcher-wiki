# ⚡ 5-Minuten-Setup: Böttcher Wiki

## 🎯 Sofort loslegen - Ihre Seite online in 5 Minuten!

### 1️⃣ Schritt 1: Accounts erstellen (2 Minuten)
```
✅ GitHub: https://github.com/signup (kostenlos)
✅ Vercel: https://vercel.com/signup (kostenlos)
✅ Railway: https://railway.app/login (kostenlos)
✅ MongoDB Atlas: https://account.mongodb.com/account/register (kostenlos)
```

### 2️⃣ Schritt 2: Repository erstellen (30 Sekunden)
1. GitHub → New Repository
2. Name: `boettcher-wiki`
3. Public ✅
4. Create Repository

### 3️⃣ Schritt 3: Code hochladen (1 Minute)
```bash
# Alle Dateien in Ihr Repository kopieren
git clone https://github.com/IHR-USERNAME/boettcher-wiki.git
cd boettcher-wiki

# Alle Dateien aus /app/ hierher kopieren
# Dann:
git add .
git commit -m "Initial commit"
git push origin main
```

### 4️⃣ Schritt 4: Services verbinden (1 Minute)

#### Vercel (Frontend):
1. Vercel → Import Git Repository
2. Wählen Sie `boettcher-wiki`
3. Framework: React
4. Root Directory: `frontend`
5. Deploy!

#### Railway (Backend):
1. Railway → New Project
2. Deploy from GitHub repo
3. Wählen Sie `boettcher-wiki`
4. Root Directory: `backend`
5. Deploy!

#### MongoDB Atlas (Datenbank):
1. MongoDB Atlas → Build a Database
2. Free Tier auswählen
3. Cluster erstellen
4. Connection String kopieren

### 5️⃣ Schritt 5: Environment Variables (30 Sekunden)

#### Vercel Environment Variables:
```env
REACT_APP_BACKEND_URL=https://ihr-backend-name.railway.app
```

#### Railway Environment Variables:
```env
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
SECRET_KEY=ihr-super-geheimer-schlüssel
```

### 🎉 Fertig! Ihre Seite ist online!

**Frontend**: https://boettcher-wiki.vercel.app
**Backend**: https://boettcher-wiki-backend.railway.app

---

## 🔧 Anpassungen vornehmen

### 1. Admin-Passwort ändern:
```python
# backend/server.py - Zeile 47
ADMIN_CREDENTIALS = {
    "ihr_admin": "ihr_neues_passwort",
    "ihr_manager": "ihr_manager_passwort"
}
```

### 2. Firmenname ändern:
```javascript
// frontend/src/App.js - Zeile ~XXX
<h1>Ihr Firmenname</h1>
<p>Ihre Beschreibung</p>
```

### 3. Änderungen hochladen:
```bash
git add .
git commit -m "Anpassungen vorgenommen"
git push origin main
```
→ **Automatisches Update!** Seite ist in 2 Minuten aktualisiert!

---

## 📞 Support

### Häufige Probleme:
1. **Build-Fehler**: GitHub Actions Logs prüfen
2. **Seite nicht erreichbar**: 5 Minuten warten (Deployment-Zeit)
3. **Datenbank-Verbindung**: MongoDB Atlas IP-Whitelist prüfen

### Logs anzeigen:
- **GitHub**: Repository → Actions
- **Vercel**: Dashboard → Project → Functions
- **Railway**: Dashboard → Service → Logs

---

## 🎯 Nächste Schritte

1. ✅ **Seite testen**: Admin-Login mit Standard-Zugangsdaten
2. ✅ **Erste Einträge**: Wissenseinträge hinzufügen
3. ✅ **Anpassungen**: Design und Inhalte anpassen
4. ✅ **Team einführen**: Kollegen zeigen, wie es funktioniert

**Ihre Böttcher Wiki ist jetzt live und einsatzbereit! 🚀**