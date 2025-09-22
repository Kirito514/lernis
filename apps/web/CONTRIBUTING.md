# Contributing to EduNFT

Thank you for your interest in contributing to EduNFT! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/edunft-mvp.git
   cd edunft-mvp
   ```
3. **Set up the development environment**:
   ```bash
   # Run setup script
   ./scripts/setup.sh  # Linux/Mac
   # or
   scripts/setup.bat   # Windows
   
   # Or manually:
   pnpm install
   cp env.example .env
   # Edit .env with your configuration
   ```

## 🛠️ Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages
Follow the conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(auth): add OAuth2 integration`
- `fix(api): resolve certificate validation bug`
- `docs(readme): update installation instructions`

### Code Style

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

#### Solidity
- Follow Solidity style guide
- Use OpenZeppelin contracts when possible
- Add NatSpec documentation
- Include comprehensive tests

#### React/Next.js
- Use functional components with hooks
- Implement proper error boundaries
- Follow accessibility guidelines
- Use TailwindCSS for styling

## 🧪 Testing

### Running Tests
```bash
# All tests
pnpm test

# Specific packages
pnpm --filter contracts test
pnpm --filter api test
pnpm --filter web test
```

### Writing Tests
- Write tests for all new features
- Aim for >80% code coverage
- Use descriptive test names
- Test both success and error cases

### Test Structure
```typescript
describe('FeatureName', () => {
  describe('when condition', () => {
    it('should do something', () => {
      // Test implementation
    });
  });
});
```

## 📝 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the coding standards
3. **Write tests** for your changes
4. **Update documentation** if needed
5. **Run the test suite** to ensure nothing is broken
6. **Commit your changes** with descriptive messages
7. **Push to your fork** and create a Pull Request

### PR Requirements
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No breaking changes (or clearly documented)
- [ ] Security considerations addressed

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details**:
   - OS and version
   - Node.js version
   - pnpm version
   - Browser (for frontend issues)

2. **Steps to reproduce**:
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Error messages**:
   - Full error stack traces
   - Console logs
   - Network errors

## 💡 Feature Requests

For feature requests, please:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** and problem it solves
3. **Provide examples** of how it would work
4. **Consider implementation complexity**

## 🔒 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to: security@edunft.io
- Include detailed reproduction steps
- Allow time for response before disclosure

### Security Guidelines
- Never commit secrets or private keys
- Use environment variables for sensitive data
- Validate all user inputs
- Follow OWASP security guidelines
- Keep dependencies updated

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Include examples in documentation
- Keep README files updated
- Document API endpoints

### User Documentation
- Write clear, concise instructions
- Include screenshots for UI changes
- Provide troubleshooting guides
- Keep documentation in sync with code

## 🏗️ Architecture Guidelines

### Backend (API)
- Use dependency injection
- Implement proper error handling
- Follow RESTful API design
- Use middleware for cross-cutting concerns

### Frontend (Web)
- Use React hooks and functional components
- Implement proper state management
- Follow accessibility guidelines
- Optimize for performance

### Smart Contracts
- Use upgradeable patterns when appropriate
- Implement proper access controls
- Include comprehensive events
- Follow gas optimization best practices

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional test coverage
- [ ] Performance optimizations
- [ ] Security improvements
- [ ] Documentation updates

### Medium Priority
- [ ] New features
- [ ] UI/UX improvements
- [ ] Integration tests
- [ ] Monitoring and logging

### Low Priority
- [ ] Code refactoring
- [ ] Dependency updates
- [ ] Build optimizations
- [ ] Developer experience improvements

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative
- Help others when possible
- Share knowledge and resources
- Participate in discussions
- Mentor new contributors

### Be Professional
- Keep discussions on-topic
- Avoid spam or off-topic comments
- Follow the project's code of conduct
- Report inappropriate behavior

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: For real-time chat (if available)
- **Email**: For security issues or private matters

## 🏆 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation
- Community highlights

Thank you for contributing to EduNFT! 🎉
