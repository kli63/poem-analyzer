# Poetry Analysis Tool

An interactive web application for analyzing poetry using AI assistance. This tool allows users to upload poems and receive detailed feedback on specific words, lines, and poetic devices.

## Features

- Upload and parse poetry files
- Interactive word and line selection
- AI-powered analysis of poetic elements
- Real-time feedback with context awareness
- Support for technical poetry aspects (enjambment, etc.)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

## Project Setup

This project uses Next.js with TypeScript and Tailwind CSS, integrating shadcn/ui components.

### Option 1: Fresh Installation

1. Create a new Next.js project with the app router:
```bash
npx create-next-app@latest poem-analyzer --typescript --tailwind --eslint
cd poem-analyzer
```

2. Run the setup script to install additional dependencies:
```bash
chmod +x setup.sh
./setup.sh
```

3. Configure your environment variable:
```bash
echo "NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here" > .env.local
```

### Option 2: Using Existing Project

If you're adding this to an existing Next.js project:

1. Clone the repository:
```bash
git clone https://github.com/kli63/poem-analyzer.git
cd poem-analyzer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create your `.env.local` and replace with your API key:
```bash
echo "NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here" > .env.local
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Project Structure

```
poem-analyzer/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   └── alert.tsx
│   │   ├── ChatInterface.tsx
│   │   └── PoemAnalyzer.tsx
│   ├── lib/
│   │   └── openai.ts
│   └── types/
│       ├── poem.ts
│       └── util.ts
├── .env.local
├── .gitignore
├── package.json
├── setup.sh
├── tailwind.config.ts
└── tsconfig.json
```

## Dependencies

The project requires several dependencies that are handled by the setup script:

### Core Dependencies
- next
- react
- react-dom
- openai
- lucide-react
- typescript

### UI Dependencies (shadcn/ui)
- @radix-ui/react-alert-dialog
- @radix-ui/react-slot
- class-variance-authority
- clsx
- tailwind-merge

### Development Dependencies
- eslint
- eslint-config-next
- autoprefixer
- postcss
- tailwindcss
- typescript
- @types/node
- @types/react
- @types/react-dom

## Environment Setup

1. Get an OpenAI API key:
   - Visit [OpenAI's platform](https://platform.openai.com/)
   - Sign up or log in
   - Go to API keys section
   - Create a new secret key
   - Save the key (it won't be shown again)

2. Configure your environment:
   - Create `.env.local` in the project root
   - Add your OpenAI API key
   - Never commit this file to version control

## Usage

1. Start the application
2. Click "Upload Poem" to load a .txt file containing your poem
3. Select either "Word Mode" or "Line Mode"
4. Click on words or lines to receive AI analysis
5. Add context in the text area for more specific feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js 13+ (App Router)
- Styled with Tailwind CSS
- AI powered by OpenAI's GPT-4
- UI components from shadcn/ui

## Security Notes

1. Never commit `.env.local` or expose your OpenAI API key
2. The project includes a `.gitignore` file to prevent accidental exposure
3. Always verify no sensitive data is included in commits
4. In production, consider moving API calls to secure backend endpoints

## Troubleshooting

If you encounter issues:

1. Ensure Node.js version is 16 or higher
2. Verify all dependencies are installed
3. Check that `.env.local` is properly configured
4. Confirm Tailwind CSS is properly set up
5. Verify shadcn/ui components are correctly imported