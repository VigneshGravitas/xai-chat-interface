# X.AI Chat Interface

A modern React-based chat interface that integrates with X.AI's Grok model. Features a sleek dark theme, markdown support, and document Q&A capabilities.

## Features

- Real-time chat with X.AI's Grok model
- Document Q&A support with PDF upload
- Modern dark theme interface
- Markdown rendering support
- One-click response copying
- Responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (comes with Node.js)
- An X.AI API key

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xai-chat-interface
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables**
   Create a `.env` file in the root directory and add your X.AI API key:
   ```
   REACT_APP_XAI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The app will open in your default browser at `http://localhost:3002`

## Required Dependencies

This project uses the following key dependencies:
- React
- Material-UI
- react-markdown
- remark-gfm
- PDF.js

## Usage

1. **Standard Chat**
   - Type your message in the left text area
   - Click the "SEND" button or press Enter
   - View Grok's response in the right panel
   - Use the copy button to copy responses

2. **Document Q&A**
   - Switch to the Document Q&A tab
   - Upload a PDF document
   - Ask questions about the document content
   - Receive context-aware responses

## Development

The project structure is organized as follows:
```
src/
  ├── components/
  │   ├── Chat.js           # Main chat interface
  │   └── DocumentQA.js     # Document Q&A interface
  ├── App.js                # Main application component
  └── index.js              # Application entry point
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

[MIT License](LICENSE)

---

For more information about Create React App, check out the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
