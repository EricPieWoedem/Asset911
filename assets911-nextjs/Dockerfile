FROM node:18-alpine as BUILD_IMAGE
WORKDIR /app
COPY package.json yarn.lock ./
# install dependencies
RUN npm install
COPY . .

ENV NEXT_PUBLIC_URL=https://api.asset911.com
ENV NEXT_PUBLIC_GOOGLE_AUTH=300564993874-v2ksf5kgm7hki0tpu4dalf7vgrg4ktab.apps.googleusercontent.com
ENV NODE_ENV=production

RUN npm run build


FROM node:18-alpine
WORKDIR /app
# copy from build image
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/.next ./.next
COPY --from=BUILD_IMAGE /app/public ./public
COPY --from=BUILD_IMAGE /app/next.config.js ./next.config.js

CMD ["npm", "run", "start"]