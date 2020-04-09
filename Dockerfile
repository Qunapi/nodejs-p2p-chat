FROM node:latest
WORKDIR /app
COPY package.json /app
RUN npm i 
COPY . /app
CMD ["npm", "start"]
# replace this with your application's default port
EXPOSE 8888