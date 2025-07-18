# 🚀 Ein-Klick-Deployment: Böttcher Wiki

## 🎯 Automatisches Deployment nach GitHub-Push

Nach dem Push zu GitHub wird Ihre Seite automatisch online gestellt!

### 📋 Einmalige Vorbereitung (5 Minuten)

#### 1. Accounts erstellen
- **GitHub**: https://github.com (kostenlos)
- **Vercel**: https://vercel.com (kostenlos für Frontend)
- **Railway**: https://railway.app (kostenlos für Backend)
- **MongoDB Atlas**: https://mongodb.com/atlas (kostenlos)

#### 2. Repository erstellen
```bash
# GitHub Repository erstellen
# Name: boettcher-wiki
# Public oder Private
```

#### 3. Automatische Tokens erstellen

##### a) Vercel Token
1. Gehen Sie zu https://vercel.com/account/tokens
2. Klicken Sie "Create Token"
3. Name: `boettcher-wiki-token`
4. Kopieren Sie den Token (speichern Sie ihn!)

##### b) Railway Token
1. Gehen Sie zu https://railway.app/account/tokens
2. Klicken Sie "Create Token"
3. Name: `boettcher-wiki-token`
4. Kopieren Sie den Token (speichern Sie ihn!)

##### c) MongoDB Atlas
1. Gehen Sie zu https://mongodb.com/atlas
2. Erstellen Sie kostenlosen Cluster
3. Kopieren Sie Connection String

#### 4. GitHub Secrets einrichten
1. Gehen Sie zu Ihrem Repository
2. Settings → Secrets and variables → Actions
3. Fügen Sie folgende Secrets hinzu:

```
VERCEL_TOKEN=ihr_vercel_token
VERCEL_ORG_ID=ihr_vercel_org_id
VERCEL_PROJECT_ID=ihr_vercel_project_id
RAILWAY_TOKEN=ihr_railway_token
BACKEND_URL=https://ihr-backend-name.railway.app
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
```

### 🚀 Deployment-Prozess

#### 1. Code zu GitHub pushen
```bash
git add .
git commit -m "Deploy Böttcher Wiki"
git push origin main
```

#### 2. Automatischer Build-Prozess
- **GitHub Actions** startet automatisch
- **Frontend** wird zu Vercel deployed
- **Backend** wird zu Railway deployed
- **Datenbank** verbindet sich mit MongoDB Atlas

#### 3. Fertig! 🎉
- **Frontend**: https://boettcher-wiki.vercel.app
- **Backend**: https://boettcher-wiki-backend.railway.app
- **Automatische Updates** bei jedem Push

### 🔧 Konfiguration

#### Frontend Environment Variables
```env
REACT_APP_BACKEND_URL=https://ihr-backend-name.railway.app
```

#### Backend Environment Variables
```env
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
SECRET_KEY=ihr-super-geheimer-schlüssel
```

### 📊 Monitoring

#### Build-Status prüfen
1. GitHub → Actions Tab
2. Letzter Build-Status
3. Logs anzeigen bei Fehlern

#### Live-URLs prüfen
- **Frontend**: Vercel Dashboard
- **Backend**: Railway Dashboard
- **Datenbank**: MongoDB Atlas

### 🛠️ Troubleshooting

#### Häufige Probleme:
1. **Build schlägt fehl**: Prüfen Sie GitHub Actions Logs
2. **Backend nicht erreichbar**: Prüfen Sie Railway Logs
3. **Datenbank-Verbindung**: Prüfen Sie MongoDB Atlas Whitelist

#### Logs anzeigen:
```bash
# GitHub Actions
# → Repository → Actions → Build Details

# Railway
# → Dashboard → Service → Logs

# Vercel
# → Dashboard → Project → Functions → Logs
```

### 🔄 Updates durchführen

```bash
# Änderungen vornehmen
# Dateien bearbeiten...

# Zu GitHub pushen
git add .
git commit -m "Update: Beschreibung der Änderung"
git push origin main

# Automatisches Deployment startet!
```

### 🎯 Domains einrichten

#### Eigene Domain verwenden:
1. **Vercel**: Custom Domain hinzufügen
2. **Railway**: Custom Domain hinzufügen
3. **DNS-Einstellungen**: Bei Ihrem Domain-Provider

#### SSL-Zertifikate:
- **Automatisch**: Vercel und Railway erstellen automatisch SSL-Zertifikate
- **Kostenlos**: Let's Encrypt wird verwendet

### 🔒 Sicherheit

#### Produktions-Einstellungen:
1. **Admin-Passwörter ändern**
2. **JWT-Secret aktualisieren**
3. **Environment Variables prüfen**
4. **HTTPS erzwingen**

### 📈 Skalierung

#### Automatische Skalierung:
- **Vercel**: Automatisch basierend auf Traffic
- **Railway**: Automatisch basierend auf Ressourcen
- **MongoDB**: Automatisch basierend auf Speicher

### 💰 Kosten

#### Kostenlose Limits:
- **Vercel**: 100GB Bandwidth, unlimited deployments
- **Railway**: 500h/month, 1GB RAM, 1GB Storage
- **MongoDB Atlas**: 512MB Storage, unlimited connections

#### Upgrade bei Bedarf:
- **Vercel Pro**: $20/month
- **Railway Pro**: $5/month
- **MongoDB Atlas**: $9/month

---

## 🎉 Zusammenfassung

### Ein-Klick-Deployment:
1. ✅ **Einmalige Vorbereitung** (5 Minuten)
2. ✅ **GitHub Push** → Automatisches Deployment
3. ✅ **Seite ist online** → Fertig!

### Ihre URLs:
- **Frontend**: https://boettcher-wiki.vercel.app
- **Backend**: https://boettcher-wiki-backend.railway.app
- **Admin**: https://boettcher-wiki.vercel.app → Admin Login

### Vorteile:
- 🚀 **Automatisches Deployment**
- 🆓 **Kostenlos** (bis zu den Limits)
- 🔄 **Continuous Integration**
- 🛡️ **Automatische SSL-Zertifikate**
- 📊 **Monitoring und Logs**
- 🌍 **Global verfügbar**

**Push → Live! Einfacher geht's nicht! 🎯**