install:
	npm ci

run:
	npx webpack serve

build:
	NODE_ENV=production npx webpack

lint:
	npx eslint .
