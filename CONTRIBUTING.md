# Contributing to Node Express API Boilerplate

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

- Open an [issue](../../issues) with the `bug` label
- Include: Node version, steps to reproduce, expected vs actual behavior
- Check existing issues first to avoid duplicates

### Suggesting Features

- Open an [issue](../../issues) with the `enhancement` label
- Describe the feature, use case, and why it would benefit the project

### Pull Requests

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature-name` or `fix/your-fix-name`
3. **Make changes** — follow existing code style (ESLint + Prettier)
4. **Run tests**: `npm run test:all`
5. **Commit**: Use clear messages — e.g. `Add rate limit bypass for health endpoint`
6. **Push** and open a Pull Request

### Development Setup

```bash
git clone https://github.com/hussainu6/node-express-api-boilerplate-.git
cd node-express-api-boilerplate-
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI, REDIS_URL, JWT_SECRET
docker compose up -d mongodb redis
npm run db:push
npm run db:seed
npm run dev
```

### Code Style

- **TypeScript** — strict mode, no `any` unless necessary
- **Formatting** — `npm run format` before committing
- **Linting** — `npm run lint` must pass

### Commit Convention

Prefer descriptive messages:
- `Add user avatar upload endpoint`
- `Fix JWT expiry validation for mobile tokens`
- `Update Prisma schema for soft delete`

---

**Questions?** Open a [Discussion](../../discussions) or tag [@hussainu6](https://github.com/hussainu6).
