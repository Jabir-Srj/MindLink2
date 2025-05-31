# MindLink

A safe space for mental health support and creative expression, built with Next.js and Supabase.

## Features
- User friendly UI.
- Mood Diary with emoji tracking and visualization
- Anonymous Confession Wall
- Peer Support Chat (moderated).
- Creative Space for anonymous content posting.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenRouter API key (for AI chat functionality)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Jabir-Srj/mindlink2.git
cd mindlink2
```

2. Install dependencies:
```bash
npm install
```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Once created, go to Project Settings > API
   - Copy your project URL and anon key

4. Get an OpenRouter API key:
   - Go to [OpenRouter](https://openrouter.ai/keys)
   - Create an account and generate an API key
   - This key will be used for the AI chat functionality

5. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your credentials in `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     NEXT_PUBLIC_OPENROUTER_API_KEY=your-openrouter-api-key
     ```
   - Never commit `.env.local` or any other `.env` files to version control
   - The `.env.example` file serves as a template for required environment variables

6. Set up your Supabase database tables:
   - mood_entries (date, mood, note)
   - confessions (content)
   - chat_messages (content)
   - creative_uploads (file_name, description)

7. Run the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### mood_entries
- id: uuid (primary key)
- date: timestamp
- mood: integer
- note: text
- user_id: uuid (foreign key to auth.users)

### confessions
- id: uuid (primary key)
- content: text
- created_at: timestamp
- user_id: uuid (foreign key to auth.users)

### chat_messages
- id: uuid (primary key)
- content: text
- created_at: timestamp
- user_id: uuid (foreign key to auth.users)

### creative_uploads
- id: uuid (primary key)
- file_name: text
- description: text
- created_at: timestamp
- user_id: uuid (foreign key to auth.users)

## Security

- All user data is protected with Row Level Security (RLS)
- Anonymous uploads are stored securely
- Chat messages are moderated by peer mentors
- User authentication is handled by Supabase Auth

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
