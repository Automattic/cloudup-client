
test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require should \
		--timeout 30s

.PHONY: test
