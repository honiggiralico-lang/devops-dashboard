# DevOps Infrastructure & Health Monitor

Una piattaforma moderna per il monitoraggio e la gestione dello stato di salute dei microservizi aziendali, basata su un'architettura **Full-Stack containerizzata** e integrata con una pipeline di **Continuous Integration (CI/CD)** automatizzata su **Jenkins** e **GitHub Actions**.

---

## Indice dei Contenuti
1. [Descrizione del Progetto](#descrizione-del-progetto)
2. [Architettura di Sistema](#architettura-di-sistema)
3. [La Pipeline CI/CD (Jenkins & GitHub Actions)](#la-pipeline-cicd)
4. [Stack Tecnologico](#stack-tecnologico)
5. [Struttura del Repository](#struttura-del-repository)
6. [Avvio Rapido con Podman Compose](#avvio-rapido-con-podman-compose)
7. [Documentazione API REST](#documentazione-api-rest)
8. [Esecuzione Manuale dei Test](#esecuzione-manuale-dei-test)
9. [Best Practice DevOps Implementate](#best-practice-devops-implementate)
10. [Licenza](#licenza)

---

## Descrizione del Progetto

Il progetto nasce per rispondere a un'esigenza fondamentale dei team sistemistici e DevOps: avere un **cruscotto centralizzato e reattivo** per visualizzare lo stato operativo dei server e dei nodi di calcolo dell'infrastruttura.

L'applicazione consente di:
* Registrare nuovi nodi e microservizi specificando ambiente (`production`, `staging`, `development`), carico CPU e consumo RAM.
* Determinare in tempo reale e in automatico lo stato di salute (`Healthy`, `Warning`, `Critical`) in base a soglie percentuali prestabilite.
* Persistere tutte le metriche e lo storico su un database relazionale **PostgreSQL**.
* Garantire che nessun rilascio contenga codice difettoso grazie all'adozione del principio **Fail-Fast** applicato sia con **Pytest** sia tramite pipeline dichiarative di **Jenkins**.

---

## Architettura di Sistema

L'architettura a runtime è composta da tre container isolati all'interno di un bridge di rete virtuale gestito da **Podman Compose**:

```text
                     ┌──────────────────────────────────────────────┐
                     │          CLIENT BROWSER (Utente)             │
                     └───────────────┬──────────────────────────────┘
                                     │
           Richieste Web (Porta 3000)│    Chiamate API REST (Porta 8000)
                                     ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ RETE VIRTUALE PODMAN                                                          │
│                                                                               │
│  ┌─────────────────────────┐               ┌───────────────────────────────┐  │
│  │   devops-frontend       │               │        devops-backend         │  │
│  │   (Nginx Alpine)        │               │      (FastAPI / Python 3.12)  │  │
│  │                         │               │                               │  │
│  │ • Serve l'app compilata │               │ • ASGI Server Uvicorn         │  │
│  │   in React/TypeScript   │               │ • Validazione Pydantic        │  │
│  │ • Multi-Stage Build     │               │ • Swagger UI (/docs)          │  │
│  │ • Routing SPA configurato│              │ • Middleware CORS attivo      │  │
│  └─────────────────────────┘               └───────────────┬───────────────┘  │
│                                                            │                  │
│                                                 Connessione│SQLAlchemy        │
│                                                 Porta 5432 │TCP               │
│                                                            ▼                  │
│                                            ┌───────────────────────────────┐  │
│                                            │        devops-postgres        │  │
│                                            │         (PostgreSQL 16)       │  │
│                                            │                               │  │
│                                            │ • Healthcheck attivo          │  │
│                                            │ • Transazioni ACID            │  │
│                                            └───────────────┬───────────────┘  │
│                                                            │                  │
│                                                Montaggio di│Volume Logico     │
│                                                            ▼                  │
│                                               ┌─────────────────────────┐     │
│                                               │   Volume: postgres_data │     │
│                                               │ (Dati salvati su disco) │     │
│                                               └─────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## La Pipeline CI/CD

Il ciclo di vita del software è automatizzato tramite una pipeline dichiarativa definita nel file `Jenkinsfile`:

```text
[ Git Commit & Push ]
        │
        ▼
[ Jenkins Controller ]
   │
   ├─► 1. STAGE: Checkout
   │      Clona in modo deterministico il branch selezionato da GitHub.
   │
   ├─► 2. STAGE: Test Backend (Pytest)
   │      Istanzia un virtualenv, installa i requisiti ed esegue la suite di test.
   │      Se un test fallisce, il processo esce con codice != 0 e blocca il rilascio.
   │
   ├─► 3. STAGE: Build Verifica Frontend
   │      Esegue il comando 'npm ci' e 'npm run build' con Vite per verificare
   │      la totale assenza di errori di sintassi o incompatibilità TypeScript.
   │
   └─► 4. STAGE: Packaging Container
          Certifica gli artefatti e autorizza l'avvio o la distribuzione dei container.
```

---

## Stack Tecnologico

### Backend & API
* **Linguaggio:** Python 3.12
* **Web Framework:** FastAPI (asincrono nativo)
* **Server ASGI:** Uvicorn
* **Validazione Dati:** Pydantic v2
* **ORM:** SQLAlchemy v2.0
* **Driver PostgreSQL:** Psycopg (versione 3 con estensioni binarie)
* **Testing:** Pytest & HTTPX (TestClient)

### Frontend & Interfaccia Utente
* **Framework:** React 19 con TypeScript
* **Strumento di Build:** Vite
* **Stile Grafico:** Tailwind CSS v4 (approccio utility-first)
* **Iconografia:** Lucide-react
* **Web Server di Produzione:** Nginx (immagine minimale su base Alpine Linux)

### Sistemi & DevOps
* **Container Engine:** Podman (modalità rootless e standard OCI)
* **Orchestrazione:** Podman Compose / Docker Compose
* **Automazione CI/CD:** Jenkins (Pipeline as Code via `Jenkinsfile`) & GitHub Actions
* **Database:** PostgreSQL 16 Alpine
* **Ambiente di Sviluppo:** Fedora Linux

---

## Struttura del Repository

```text
devops-dashboard/
├── .github/
│   └── workflows/
│       └── ci.yml             # Workflow automatico di GitHub Actions
├── backend/
│   ├── app/
│   │   ├── crud.py            # Logica delle query al database (Create, Read, Update, Delete)
│   │   ├── database.py        # Configurazione sessione DB e fallback SQLite/PostgreSQL
│   │   ├── main.py            # Router FastAPI, gestione rotte HTTP e CORS
│   │   ├── models.py          # Definizione delle tabelle relazionali (SQLAlchemy)
│   │   └── schemas.py         # Schemi di validazione dei pacchetti JSON (Pydantic)
│   ├── tests/
│   │   └── test_services.py   # Suite di test automatici
│   ├── .dockerignore          # Esclusione cache e database locali dal container
│   ├── Dockerfile             # Ricetta OCI per il backend (Python 3.12-slim)
│   └── requirements.txt       # Dipendenze Python
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Componente principale della Dashboard
│   │   ├── index.css          # Direttive Tailwind CSS v4
│   │   └── main.tsx           # Entrypoint TypeScript dell'interfaccia
│   ├── .dockerignore          # Esclusione node_modules dalla build
│   ├── Dockerfile             # Multi-stage build (Builder Node -> Runtime Nginx)
│   ├── nginx.conf             # Configurazione del web server per SPA
│   ├── package.json           # Dipendenze e script npm
│   └── vite.config.ts         # Configurazione bundler Vite
├── .env.example               # Template delle variabili d'ambiente
├── .gitignore                 # Regole di esclusione di Git
├── docker-compose.yml         # File di orchestrazione dei servizi a microservizi
├── Jenkinsfile                # Pipeline CI/CD dichiarativa per Jenkins
├── LICENSE                    # Licenza open-source MIT
└── README.md                  # Documentazione tecnica del progetto
```

---

## Avvio Rapido con Podman Compose

### Prerequisiti
* Sistema Linux con **Podman** e **Podman Compose** (o Docker con Docker Compose).
* Git installato.

### 1. Clonare il repository
```bash
git clone https://github.com/TUO-USERNAME/devops-dashboard.git
cd devops-dashboard
```

### 2. Configurare le variabili d'ambiente
```bash
cp .env.example .env
```

### 3. Avviare l'infrastruttura
```bash
podman compose up -d
```
*(o `docker compose up -d`)*

### 4. Accedere ai servizi
* **Dashboard Web:** [http://localhost:3000](http://localhost:3000)
* **Documentazione Interattiva API (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Porta Database PostgreSQL:** `localhost:5432`

Per arrestare i servizi preservando i dati:
```bash
podman compose down
```

---

## Documentazione API REST

Le API sono conformi allo standard OpenAPI e testabili direttamente tramite Swagger UI su `/docs`:

| Metodo | Rotta HTTP | Descrizione | Codice Successo |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Health-check di base dello stato dell'API | `200 OK` |
| **GET** | `/api/v1/services` | Elenco di tutti i servizi e nodi monitorati | `200 OK` |
| **POST** | `/api/v1/services` | Registrazione di un nuovo nodo/servizio | `201 Created` |
| **GET** | `/api/v1/services/{id}` | Dettagli di un singolo servizio per ID | `200 OK` |
| **PATCH**| `/api/v1/services/{id}` | Aggiornamento parziale delle metriche (CPU, RAM, stato) | `200 OK` |
| **DELETE**| `/api/v1/services/{id}` | Rimozione di un servizio dal monitoraggio | `204 No Content` |

---

## Esecuzione Manuale dei Test

Se si desidera eseguire la suite di test unitari sul backend senza avviare i container:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest -v
```

---

## Best Practice DevOps Implementate

1. **Multi-Stage Build nel Frontend:**  
   L'immagine finale di produzione non contiene Node.js, `npm` o file di build pesanti. Il codice compilato viene ospitato direttamente dentro **Nginx Alpine**, riducendo l'immagine a soli **~25 MB** e azzerando le vulnerabilità del compilatore a runtime.
2. **Container Rootless e Daemonless:**  
   L'intero stack è validato per l'esecuzione con **Podman** senza necessità di privilegi di root (`rootless`), seguendo le raccomandazioni di sicurezza del mondo Red Hat / Enterprise Linux.
3. **Controllo di Stato Deterministico (Healthcheck):**  
   Nel file compose, il backend attende la condizione `service_healthy` del database tramite la probe `pg_isready`, prevenendo errori di connessione all'avvio.
4. **Isolamento delle dipendenze e Fail-Fast:**  
   La pipeline CI interrompe la catena di rilascio se anche uno solo dei test automatici fallisce, impedendo il push di immagini difettose.

---

## Autore
**Gino Giralico**
- GitHub: [@honiggiralico-lang](https://github.com/honiggiralico-lang)

## Licenza

Rilasciato sotto licenza [MIT](LICENSE).
