# Runs the Remotion MCP server over Streamable HTTP so that it can be added as
# a remote connector. Rendering is delegated to Remotion Lambda, so this image
# does not need Chromium.
#
#   docker build -t remotion-mcp .
#   docker run -p 3111:3111 \
#     -e REMOTION_MCP_SERVE_URL=... \
#     -e REMOTION_MCP_FUNCTION_NAME=... \
#     -e AWS_ACCESS_KEY_ID=... \
#     -e AWS_SECRET_ACCESS_KEY=... \
#     remotion-mcp
FROM node:22-bookworm-slim

WORKDIR /usr/app

# `@remotion/lambda-client` is an optional peer dependency of `@remotion/mcp`
# and is what talks to AWS.
ARG REMOTION_VERSION=latest
RUN npm i --no-save --omit=dev \
  @remotion/mcp@${REMOTION_VERSION} \
  @remotion/lambda-client@${REMOTION_VERSION}

ENV PORT=3111
EXPOSE 3111

USER node

# Bind to 0.0.0.0 so that the port is reachable from outside the container.
# Put a proxy that authenticates requests in front of this - the server itself
# has no authentication.
#
# The bin is invoked directly instead of through `npx`, which would need a
# writable cache directory.
CMD ["node", "node_modules/.bin/remotion-mcp", "--http", "--host", "0.0.0.0"]
