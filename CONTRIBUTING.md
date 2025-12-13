# Contributing Guidelines

## Development Workflow

1. **Follow TDD Principles**
   - Write tests first (Red)
   - Implement functionality (Green)
   - Refactor code (Refactor)

2. **Git Commit Messages**
   - Use clear, descriptive commit messages
   - Follow conventional commit format: `type: description`
   - Examples:
     - `feat: Add user registration endpoint`
     - `test: Add tests for sweet service`
     - `fix: Fix authentication middleware`

3. **AI Co-authorship**
   - When using AI tools, add co-author trailer to commits
   - Format:
     ```
     Co-authored-by: AI Tool Name <ai@users.noreply.github.com>
     ```

4. **Code Quality**
   - Follow SOLID principles
   - Write clean, readable code
   - Add meaningful comments
   - Maintain test coverage

5. **Testing**
   - Write tests for all new features
   - Ensure all tests pass before committing
   - Aim for high test coverage

## Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/feature-name`

## Pull Request Process

1. Create a feature branch
2. Write tests first (TDD)
3. Implement feature
4. Ensure all tests pass
5. Update documentation if needed
6. Create pull request with clear description

