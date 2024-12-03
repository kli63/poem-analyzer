#!/bin/bash

# Install required packages
npm install --save \
  @types/node \
  @types/react \
  @types/react-dom \
  lucide-react \
  next \
  openai \
  react \
  react-dom \
  typescript

# Install UI dependencies (assuming shadcn/ui is being used)
npm install --save \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-slot \
  class-variance-authority \
  clsx \
  tailwind-merge

# Install development dependencies
npm install --save-dev \
  eslint \
  eslint-config-next \
  autoprefixer \
  postcss \
  tailwindcss

# Create necessary directories
mkdir -p src/components src/lib src/types

# Create a basic tsconfig if it doesn't exist
if [ ! -f tsconfig.json ]; then
  echo '{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}' > tsconfig.json
fi

echo "Setup complete! Don't forget to:"
echo "1. Create a .env.local file with your OpenAI API key"
echo "2. Ensure your project has the correct Tailwind configuration"
echo "3. Configure your components directory for shadcn/ui if using it"