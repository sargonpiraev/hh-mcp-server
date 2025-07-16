# Contributing to HeadHunter

Thank you for your interest in contributing to the HeadHunter! This guide will help you get started with development.

## 🔧 Development Setup

### Prerequisites

- Node.js >= v18.0.0
- npm or yarn package manager
- Git

### Local Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/sargonpiraev/hh-mcp-server
   cd hh-mcp-server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your API credentials
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

### Development Commands

```bash
# Run in development mode with auto-reload
npm run dev

# Build the project
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

## 📝 Code Style

We use the following tools to maintain code quality:

- **ESLint** for linting
- **Prettier** for formatting
- **TypeScript** for type checking
- **Jest** for testing
- **Commitlint** for commit message validation

### Commit Convention

We follow [Conventional Commits](https://conventionalcommits.org/) specification:

```bash
feat: add new functionality
fix: bug fixes
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch
```

## 🚀 Release Process

We use semantic-release for automated versioning and publishing:

1. Create a pull request with your changes
2. Ensure all tests pass and code is properly formatted
3. Use conventional commit messages
4. Once merged to main, semantic-release will automatically:
   - Determine the next version number
   - Generate release notes
   - Publish to npm
   - Create a GitHub release

## 📋 Pull Request Guidelines

1. **Fork** the repository
2. **Create a branch** from `main`
3. **Make your changes** with proper tests
4. **Run the full test suite** to ensure everything works
5. **Update documentation** if needed
6. **Submit a pull request** with a clear description

### Pull Request Checklist

- [ ] Tests pass (`npm run test`)
- [ ] Code is formatted (`npm run format:check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Types are correct (`npm run typecheck`)
- [ ] Documentation is updated (if applicable)
- [ ] Conventional commit messages are used

## 🆘 Getting Help

- Check existing [issues](https://github.com/sargonpiraev/hh-mcp-server/issues)
- Create a new issue if you find a bug
- Join our [Discord](https://discord.gg/ZsWGxRGj) for community support

## 📄 License

By contributing to HeadHunter, you agree that your contributions will be licensed under the MIT License.
