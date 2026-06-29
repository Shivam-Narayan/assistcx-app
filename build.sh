#!/bin/bash

# Function to display usage information
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Build the web app Docker image"
    echo
    echo "Options:"
    echo "  --bump TYPE     Bump version (TYPE: major, minor, patch)"
    echo "  --version X.Y.Z Use specific version X.Y.Z"
    echo "  --amd           Build for AMD64 platform"
    echo "  --push          Push images to Docker Hub"
    echo "  -h, --help      Display this help message"
}

# Function to get current version from package.json
get_current_version() {
    node -p "require('./package.json').version"
}

# Function to bump version
bump_version() {
    local bump_type=$1
    local current_version=$(get_current_version)
    local new_version

    IFS='.' read -ra version_parts <<< "$current_version"
    major=${version_parts[0]}
    minor=${version_parts[1]}
    patch=${version_parts[2]}

    case $bump_type in
        major)
            new_version="$((major + 1)).0.0"
            ;;
        minor)
            new_version="${major}.$((minor + 1)).0"
            ;;
        patch)
            new_version="${major}.${minor}.$((patch + 1))"
            ;;
        *)
            echo "Invalid bump type. Use 'major', 'minor', or 'patch'." >&2
            exit 1
            ;;
    esac

    # Update package.json
    sed -i.bak "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" package.json && rm package.json.bak
    # Log to stderr instead of stdout
    echo "Bumped version from $current_version to $new_version" >&2
    
    # Commit the change - redirect output to stderr
    git add package.json >/dev/null 2>&1
    git commit -m "Bump version to $new_version" >&2
    
    # Return only the version number
    printf "%s" "$new_version"
}

# Initialize variables
PLATFORM=""
VERSION=""
BUMP_TYPE=""
PUSH_TO_DOCKER_HUB=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --bump)
            BUMP_TYPE="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --amd)
            PLATFORM="--platform=linux/amd64"
            shift
            ;;
        --push)
            PUSH_TO_DOCKER_HUB=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done

# Handle version bumping if requested
if [ -n "$BUMP_TYPE" ]; then
    VERSION=$(bump_version "$BUMP_TYPE")
elif [ -z "$VERSION" ]; then
    VERSION=$(get_current_version | tr -d '\r')
fi

echo "Building web app version: $VERSION"

WEB_APP_IMAGE="assistcx-web:$VERSION"
WEB_APP_LATEST="assistcx-web:latest"

# Ensure Docker CLI is set to use Buildx
export DOCKER_CLI_EXPERIMENTAL=enabled

# Build the Docker image
echo "Building assistcx-web:$VERSION"
docker buildx build $PLATFORM -t $WEB_APP_IMAGE . --load
docker tag $WEB_APP_IMAGE $WEB_APP_LATEST


# Push the images only if --push flag is provided
if [ "$PUSH_TO_DOCKER_HUB" = true ]; then
    echo "Pushing Docker images..."
    docker push $WEB_APP_IMAGE
    docker push $WEB_APP_LATEST
else
    echo "Skipping Docker push (use --push flag to push to Docker Hub)"
fi

echo "Build process completed for version $VERSION"

# If we bumped the version, push the commit and create a tag
if [ -n "$BUMP_TYPE" ]; then
    git push origin main
    git tag -a "v$VERSION" -m "Release version $VERSION"
    git push origin "v$VERSION"
    echo "Created and pushed tag v$VERSION"
fi