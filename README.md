# KnowMap

KnowMap is a React + Node.js + Python project for:
- User login/register
- Multi-source search (Wikipedia, arXiv, NewsAPI)
- Knowledge graph extraction and analysis from text

## Project Structure

- `backend/` - Express API + PostgreSQL auth/search orchestration
- `frontend/react/` - React UI (Vite)
- `knowledge_graph/` - Python NLP pipeline and graph builder

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000

# Either lowercase OR uppercase DB vars are supported
db_host=localhost
db_port=5432
db_name=knowmap_db
db_username=your_db_username
db_password=your_db_password

# Optional for uppercase style
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=knowmap_db
# DB_USERNAME=your_db_username
# DB_PASSWORD=your_db_password

# Optional: required for NewsAPI routes
# NEWS_API_KEY=your_newsapi_key
```

Start backend:

```bash
cd backend
npm run dev
```

## Frontend Setup

```bash
cd frontend/react
npm install
npm run dev
```

Optional frontend env (`frontend/react/.env`):

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Python Setup (Knowledge Graph)

Install Python dependencies (you can run these manually or use the helper command below):

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Alternatively, run the built-in installer:

```bash
cd knowledge_graph
python api_server.py install_dependencies
```

This will invoke `pip` to install packages from `requirements.txt` and download the `en_core_web_sm` model automatically.

## API Endpoints

Auth:
- `POST /login`
- `POST /register`

Search:
- `GET /api/sources`
- `POST /api/search`
- `POST /api/search/multi`
- `GET /api/search/wikipedia?q=...`
- `GET /api/search/arxiv?q=...`
- `GET /api/search/news?q=...`
- `GET /api/news/headlines?category=technology`

Knowledge Graph:
- `POST /api/knowledge-graph/process`
- `GET /api/knowledge-graph/system-info`
- `GET /api/knowledge-graph/check-dependencies`
- `POST /api/knowledge-graph/analyze`
- `POST /api/knowledge-graph/query`
- `POST /api/knowledge-graph/save`
- `GET /api/knowledge-graph/load?filePath=...`
