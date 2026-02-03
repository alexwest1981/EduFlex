
# 1. Stop backend
docker-compose stop backend

# 2. Build backend (skip tests to save time, we know it compiles if lints are ignored... wait, lints were errors?)
# Actually, let's just use docker build which runs maven usually.
# But just in case, let's run a clean maven build locally if possible, or rely on docker.
# The user has "eduflex/Dockerfile".

docker-compose up -d --build backend
