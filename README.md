# FinSight: Agentic Bank Statement Analyzer

FinSight is a high-fidelity bank statement analyzer specifically designed for the Indian banking ecosystem. It allows users to upload PDF bank statements from any bank to extract transactions, categorize spending, generate financial insights, and interact with a context-aware AI chat assistant.

## 🚀 Features

*   **Resilient PDF Parsing:** Custom parsing logic using `pdf2json` with hex-decoding and lookahead heuristics to handle varied Indian bank statement layouts across different OS environments.
*   **Two-Layer Categorization:** 
    *   **Layer 1 (Heuristics):** High-speed regex-based matching for common Indian merchants (Zomato, Swiggy, Uber, etc.).
    *   **Layer 2 (AI):** Batch processing via OpenAI's GPT-3.5 for complex or unknown transaction descriptions.
*   **Financial Insights:** Deterministic calculation of inflows, outflows, and net balance, coupled with AI-generated qualitative insights.
*   **Interactive Visualizations:** Premium dashboard featuring categorical spending charts and daily spending trends using `Recharts`.
*   **AI Chat Assistant:** A grounded financial assistant allowing users to ask specific questions about their statement data.
*   **Security Focused:** Implements magic byte validation for file uploads and ensures PII is processed using ephemeral storage.

## 🛠 Technology Stack

### Frontend
*   **Framework:** Next.js (TypeScript)
*   **Styling:** Tailwind CSS
*   **Charts:** Recharts
*   **Icons:** Lucide React

### Backend
*   **Runtime:** Node.js / Express (TypeScript/JavaScript)
*   **PDF Processing:** pdf2json
*   **AI Integration:** OpenAI API
*   **Logging:** Winston
*   **File Handling:** Multer

## 🏁 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   An OpenAI API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd data-sutram
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5001
    OPENAI_API_KEY=your_openai_api_key_here
    LOG_LEVEL=info
    ```
    Start the backend:
    ```bash
    node src/server.js
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```
    Create a `.env.local` file in the `frontend` directory:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api/v1
    ```
    Start the frontend:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   `/frontend`: Next.js application with the dashboard and chat interface.
*   `/backend/src/api`: Express routes and controllers for file uploads and chat.
*   `/backend/src/ai`: Core AI logic for categorization, insights, and chat processing.
*   `/backend/src/pipeline`: PDF extraction and parsing pipeline.

## 📝 Engineering Report

For a detailed breakdown of the "Agentic Engineering" decisions, security implementations, and scalability considerations, please refer to the REPORT.md file.

## ⚖️ License

This project is developed for a technical assessment. All rights reserved.

---
*Built with precision for Datasutram.*
