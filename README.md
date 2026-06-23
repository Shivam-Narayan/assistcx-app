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
