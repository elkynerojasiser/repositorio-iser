Extend the existing fullstack project (Node.js + Express + MySQL backend and React frontend) to implement an AI-powered chat system that answers user questions based ONLY on the content of stored thesis PDF documents.

The system must follow a Retrieval-Augmented Generation (RAG) approach.

---

1. BACKEND - PDF PROCESSING

---

When a thesis PDF is uploaded:

* Extract text from the PDF using pdf-parse
* Split the extracted text into chunks (300–500 words each)
* Store each chunk in a new database table

Create table:

thesis_chunks:

* id (PK)
* thesis_id (FK)
* content (TEXT)
* created_at

Implement a service:

* extractTextFromPDF(filePath)
* splitTextIntoChunks(text)
* saveChunks(thesisId, chunks)

Integrate this process automatically after a thesis is created or updated.

---

2. BACKEND - OPTIONAL (EMBEDDINGS PREPARATION)

---

Prepare the structure for future embeddings:

* Add column: embedding (TEXT or JSON, nullable) in thesis_chunks
* Do not fully implement vector search yet, but leave hooks ready

---

3. BACKEND - CHAT MODULE

---

Create a new module:

* routes/chat.routes.js
* controllers/chat.controller.js
* services/chat.service.js

Create endpoint:

POST /api/chat

Request body:
{
"question": "string"
}

---

4. CONTEXT RETRIEVAL (MVP VERSION)

---

Implement a simple search system:

* Extract keywords from the user question
* Search thesis_chunks using SQL LIKE:

SELECT * FROM thesis_chunks
WHERE content LIKE '%keyword%'
LIMIT 5;

* Return top relevant chunks

Combine chunks into a single context string.

---

5. OPENAI INTEGRATION

---

Install OpenAI SDK and configure:

* Use environment variable: OPENAI_API_KEY
* Use model: gpt-4.1-mini

Create function:

askAI(question, context)

The prompt must enforce:

* The assistant ONLY answers based on provided context
* If answer is not in context, say "No encontré información suficiente en los trabajos de grado"

Prompt structure:

SYSTEM:
"You are an academic assistant. Answer ONLY using the provided context."

USER:
Context:
{context}

Question:
{question}

Return clean, well-structured answers in Spanish.

---

6. CHAT RESPONSE FORMAT

---

Return JSON:

{
"answer": "...",
"sources": [
{
"thesis_id": 1,
"excerpt": "..."
}
]
}

---

7. SECURITY & VALIDATION

---

* Validate question is not empty
* Limit question length (e.g. 500 chars)
* Limit context size sent to OpenAI
* Handle API errors properly

---

8. FRONTEND - REACT CHAT UI

---

Create a new React component:

Chat.jsx

Features:

* Chat interface (messages list)
* Input box
* Send button
* Loading indicator

State:

* messages [{ role: "user" | "assistant", content: "" }]

On submit:

* Call POST /api/chat
* Append user message
* Append AI response

---

9. FRONTEND - UX DETAILS

---

* Scroll to latest message
* Disable input while loading
* Show error message if API fails

---

10. OPTIONAL FEATURES

---

* Show sources below each response
* Highlight excerpts used
* Add "clear chat" button

---

11. CODE QUALITY

---

* Use async/await
* Separate concerns (controller/service)
* Reusable utilities
* Clean error handling
* Modular and scalable code

---

12. FINAL GOAL

---

A working AI chat where:

User asks:
"¿Qué trabajos hablan de agricultura sostenible?"

System:

* Finds relevant thesis chunks
* Sends context to OpenAI
* Returns an accurate answer based on stored documents

---

Generate ALL required code:

* Backend services
* Controllers
* Routes
* SQL schema changes
* React component

Ensure everything integrates with the existing project structure.
