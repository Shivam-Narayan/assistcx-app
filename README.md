## Local Development

To run the application locally, first ensure you have the required `.env.local` variables set (such as `NEXTAUTH_BACKEND` and `BACKEND_URL`).
Additionally, ensure `public/config.json` is properly configured (e.g. `{"BACKEND_URL": "http://127.0.0.1:8000"}`) so the app connects to your local backend.

### Available Scripts

> [!WARNING]
> **Use pnpm, not npm!** This is a pnpm workspace project. Running `npm install` will corrupt the `node_modules` folder and break the application. Always use `pnpm`!

We have provided convenient pnpm scripts to manage memory limits and clear caches:

- `pnpm run dev`: Starts the Next.js development server. This uses a native Node.js invocation (`--max-old-space-size=6144`) to enforce a 6GB memory limit, avoiding out-of-memory errors.
- `pnpm run clean`: Instantly removes the `.next` cache and `node_modules` directory.
- `pnpm run reset`: Runs the clean script, then safely reinstalls all dependencies using `pnpm`. Use this if you experience stale data or corrupt node packages.

## Build and Version Management

This project uses a custom build script (`build.sh`) to manage versioning and building Docker images for the web application.

### Prerequisites

- Ensure you have Docker installed and configured on your system.
- Make sure you have Node.js installed to run the version extraction command.

### Basic Usage

To build the application with the current version (as specified in `package.json`):

```bash
./build.sh
```

### Version Bumping

To bump the version and build:

```bash
./build.sh --bump [major|minor|patch]
```

This will:

1. Increment the version in `package.json`
2. Commit the change
3. Create a new git tag
4. Build and push Docker images with the new version

### Specific Version

To build using a specific version:

```bash
./build.sh --version X.Y.Z
```

### Platform-Specific Build

To build for AMD64 platform:

```bash
./build.sh --amd
```

### Combining Options

You can combine options as needed. For example:

```bash
./build.sh --bump minor --amd
```

This will bump the minor version and build for AMD64 platform.

### Version Tagging

- The script always builds two Docker image tags:
  1. The specific version (e.g., `sshivam6495/assistcx-web:1.2.3`)
  2. The `latest` tag

### Git Integration

- When bumping versions, the script automatically commits changes to `package.json`, creates a git tag, and pushes changes to the remote repository.

### Notes

- Always run this script from the root directory of the project.
- Ensure you have the necessary permissions to push to the Docker repository and git remote.
