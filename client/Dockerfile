FROM node:20.9.0

WORKDIR /app

COPY . /app

RUN npm install

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["npm", "run", "dev"]
