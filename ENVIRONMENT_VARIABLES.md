# Environment Variables

For Vercel deployment, you need to set these environment variables in your Vercel project settings:

## Required Variables

### `DATABASE_URL`
- **Required**: Yes
- **Format**: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`
- **Description**: PostgreSQL database connection string (Supabase, Neon, or any PostgreSQL database)

### `OPENAI_API_KEY`
- **Required**: For AI features
- **Format**: `sk-your-openai-api-key-here`
- **Description**: OpenAI API key for content analysis and summarization
- **Note**: Set to `sk-fake-key-for-demo` to use demo mode without real API calls

### `JWT_SECRET`
- **Required**: Yes
- **Format**: A secure random string (32+ characters)
- **Description**: Secret key for JWT token signing and verification
- **Example**: Generate with `openssl rand -base64 32`

## Optional Variables

### `NODE_ENV`
- **Default**: `production` (on Vercel)
- **Values**: `development` or `production`
- **Description**: Determines environment mode

## Setting Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its value
4. Redeploy your project for changes to take effect

## Example Values for Testing

```
DATABASE_URL=your_database_connection_string
OPENAI_API_KEY=sk-fake-key-for-demo
JWT_SECRET=your-super-secure-jwt-secret-key-here
```