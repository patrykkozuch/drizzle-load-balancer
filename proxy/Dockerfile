FROM node:20.9.0

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 4000

HEALTHCHECK --interval=5s --timeout=5s --start-period=5s --retries=5 CMD curl --fail http://localhost:4000/health || exit 1

CMD ["npm", "run", "dev"]
