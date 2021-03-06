setup:
	npm install
	npx knex migrate:latest
	npx knex seed:run

build:
	npm run build

prepare:
	touch .env

start:
	heroku local -f Procfile.dev

start-backend:
	npx nodemon --exec npx babel-node server/bin/server.js

start-frontend:
	npx webpack-dev-server

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm run coverage
