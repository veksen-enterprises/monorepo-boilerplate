FROM node:24-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# Go toolchain for apps/api-go. Pinned to the version in apps/api-go/go.mod —
# bump both together.
ARG GO_VERSION=1.25.7
RUN ARCH="$(dpkg --print-architecture)" \
  && curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${ARCH}.tar.gz" -o /tmp/go.tgz \
  && tar -C /usr/local -xzf /tmp/go.tgz \
  && rm /tmp/go.tgz

# No Docker CLI is installed. apps/api-go's tests use testcontainers-go, which
# speaks the Docker Engine API over the bind-mounted socket directly (see
# .sandcastle/main.mts) — it never shells out to a `docker` binary.

# buf is NOT installed here — packages/proto pulls @bufbuild/buf from npm, so
# `npm install` provides it.

# Build-args for UID/GID alignment: sandcastle docker build-image
# defaults these to the host user's UID/GID so image-built files
# and bind-mounted files share an owner without runtime chown.
ARG AGENT_UID=1000
ARG AGENT_GID=1000

# Rename the base image's "node" user to "agent" and align UID/GID.
RUN groupmod -o -g $AGENT_GID node && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node
USER ${AGENT_UID}:${AGENT_GID}

# Install Claude Code CLI
RUN curl -fsSL https://claude.ai/install.sh | bash

ENV PATH="/home/agent/.local/bin:/usr/local/go/bin:/home/agent/go/bin:$PATH"
ENV GOPATH=/home/agent/go

WORKDIR /home/agent

# In worktree sandbox mode, Sandcastle bind-mounts the git worktree and overrides
# the working directory to it at container start. Structure this Dockerfile so
# that directory can serve as the project root.
ENTRYPOINT ["sleep", "infinity"]
