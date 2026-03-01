# CMU QPA Plus

[![Website](https://img.shields.io/badge/Website-cmuqpa.com-A80C1E?style=flat-square)](https://cmuqpa.com)
[![Python](https://img.shields.io/badge/Python-3.7+-blue?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> A professional Quality Point Average (QPA) calculator for Carnegie Mellon University students. Calculate your QPA and GPA instantly with an intuitive, easy-to-use web interface.

**Live Demo**: [https://cmuqpa.com](https://cmuqpa.com)

## ✨ Features

- 🎓 **Accurate QPA Calculation** - Follows CMU's official QPA calculation method
- 📊 **Dual Metrics** - Calculates both QPA (Quality Point Average) and GPA (Grade Point Average)
- 📚 **Course Units Auto-fill** - Enter a CMU course code (e.g. `15122` / `15-122`) to auto-fill units
- 🎨 **Modern UI** - Clean, responsive interface with drag-and-drop course management
- 💾 **Local Storage** - Automatically saves your courses in the browser
- ⚡ **Fast Performance** - Real-time calculations with instant feedback
- 📱 **Mobile Friendly** - Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **Privacy First** - All calculations happen locally or on your server
- 🎯 **User-Friendly** - Intuitive course management with toggle active/inactive courses

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.7+** - Core programming language
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - Lightning-fast ASGI server

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **LocalStorage API** - Client-side data persistence

## 📋 Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jacky-111111/CMU-QPA-Plus.git
   cd CMU-QPA-Plus
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## 🏃 Running the Application

### Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The application will be available at:
- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### Production Deployment

For production deployment, you can use:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use a production ASGI server like Gunicorn with Uvicorn workers:

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 📖 Usage

### Web Interface

1. Visit the website: [https://cmuqpa.com](https://cmuqpa.com)
2. Click **ADD** to add a new course
3. Enter course information:
   - Course code (optional)
   - Units (credit hours)
   - Grade (A, B, C, or D)
4. Toggle courses active/inactive to include/exclude them from calculations
5. Drag and drop courses to reorder them
6. View your **QPA**, **GPA**, and **Total Units** in real-time

### API Usage

#### Calculate QPA

**Endpoint**: `POST /calculate-qpa`

**Request Body**:
```json
{
  "grades": [
    [12, "A"],
    [9, "B"],
    [9, "A"]
  ]
}
```

**Response**:
```json
{
  "QPA": 3.73,
  "GPA": 3.67,
  "totalUnits": 30,
  "totalQualityPoints": 111.0
}
```

**Example using cURL**:
```bash
curl -X POST "http://localhost:8000/calculate-qpa" \
  -H "Content-Type: application/json" \
  -d '{"grades": [[12, "A"], [9, "B"], [9, "A"]]}'
```

**Example using Python**:
```python
import requests

url = "http://localhost:8000/calculate-qpa"
data = {
    "grades": [
        [12, "A"],
        [9, "B"],
        [9, "A"]
    ]
}

response = requests.post(url, json=data)
result = response.json()
print(f"QPA: {result['QPA']}")
print(f"GPA: {result['GPA']}")
print(f"Total Units: {result['totalUnits']}")
```

### Course Units Auto-fill (ScottyLabs Workaround)

We initially attempted to use the older ScottyLabs course API path (`api.cmucourses.com`) for unit lookup.  
In real-world testing, that path was unstable in this environment (SSL certificate verification issues and repeated 404 responses), so we switched to a more reliable endpoint strategy.

Current implementation uses:

- `https://course-tools.apis.scottylabs.org/course/<COURSE_ID>`

Behavior:

- Frontend normalizes user input:
  - `15122` -> `15-122`
  - `15 122` -> `15-122`
  - `15-122` -> `15-122`
- Lookup tries both:
  - `15-122`
  - `15122` (fallback)
- If course data is found, `units` is parsed (including string values like `"12.0"`) and applied immediately to that course row.
- Units remain manually editable if lookup fails.

Notes:

- This lookup is intended for convenience and may depend on third-party API availability.
- The app still computes QPA/GPA locally as a fallback if backend calculation is unavailable.

## 📐 QPA Calculation Formula

The QPA (Quality Point Average) is calculated using CMU's official formula:

```
QPA = Total Quality Points / Total Credit Hours
```

Where:
- **Quality Points** = Grade Points × Credit Hours
- **Grade Points**: A = 4.0, B = 3.0, C = 2.0, D = 1.0
- **GPA** = Average of grade points (not weighted by credit hours)

## 📁 Project Structure

```
CMU-QPA-Plus/
├── main.py                 # FastAPI application entry point
├── model.py                # Pydantic models for request validation
├── qpa_engine.py          # Core QPA calculation logic
├── requirements.txt        # Python dependencies
├── test_qpa_engine.py     # Unit tests
├── README.md              # This file
└── static/                # Frontend files
    ├── index.html         # Main HTML page
    ├── app.js             # Frontend JavaScript logic
    └── style.css          # Stylesheet
```

## 🧪 Testing

Run the test suite:

```bash
python test_qpa_engine.py
```

Or use pytest if you prefer:

```bash
pip install pytest
pytest test_qpa_engine.py
```

## 🔧 Development

### Project Architecture

- **Backend** (`main.py`): FastAPI server handling API requests and serving static files
- **Engine** (`qpa_engine.py`): Core calculation logic, separated for testability
- **Models** (`model.py`): Data validation schemas using Pydantic
- **Frontend** (`static/`): Vanilla JavaScript SPA with local storage persistence

### Key Features Implementation

- **Real-time Calculation**: Frontend sends requests to backend API on every change
- **Offline Fallback**: Frontend includes a local calculation function as backup
- **Course Management**: Full CRUD operations with drag-and-drop reordering
- **Persistent Storage**: Browser LocalStorage API for client-side data persistence

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is not an official tool presented by Carnegie Mellon University. This calculator is for reference only. For official grades and QPA, please visit [CMU SIO](https://www.cmu.edu/hub/sio/about.html).

## 👤 Author

**Jack Yu**

- Email: jacky2@andrew.cmu.edu
- GitHub: [@Jacky-111111](https://github.com/Jacky-111111)
- Website: [cmuqpa.com](https://cmuqpa.com)

## 🙏 Acknowledgments

- Inspired by [Omar Sinan's CMU QPA Calculator](https://omarsinan.github.io/projects/cmuqpa/)
- Built for the Carnegie Mellon University community

## 📊 API Health Check

Check if the API is running:

```bash
curl http://localhost:8000/healthz
```

Response: `{"status": "ok"}`

---

**Made with ❤️ for CMU Tartans**
