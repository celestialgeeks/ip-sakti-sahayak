# IP-SAKTI Sahayak 🪷

> Empowering Ayush Patent Intelligence & Classical Knowledge Defence — Ministry of Ayush

An AI-powered RAG assistant that answers Intellectual Property Rights (IPR) questions specific to Ayurveda with accuracy, source citation, and jurisdictional clarity.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Backend**: FastAPI (Python 3.11)
- **LLM**: NVIDIA NIM (`meta/llama-3.1-8b-instruct`)
- **Embeddings**: NVIDIA NIM (`nvidia/nv-embedqa-e5-v5`)
- **Vector DB**: Qdrant
- **Multilingual**: Sarvam AI (22 Indian languages)
- **Deployment**: Render

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (for Qdrant)

### 1. Clone & Setup
```bash
git clone <repo-url>
cd ayurveda-ip-rag
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Start Qdrant
```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 3. Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Open
Visit `http://localhost:3000`

## 📁 Project Structure

```
├── frontend/          # Next.js 14 + React + Tailwind
├── backend/           # FastAPI + RAG pipeline
│   ├── app/
│   │   ├── api/       # REST endpoints
│   │   ├── core/      # RAG, citations, classification
│   │   ├── services/  # NIM, Sarvam, Qdrant clients
│   │   ├── models/    # Pydantic schemas
│   │   └── utils/     # Prompts, text processing
│   └── data/corpus/   # Knowledge corpus documents
├── docker-compose.yml
└── render.yaml
```

## 📜 License

Built for the AYUSH community. All rights reserved.
