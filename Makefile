
test:
	@./node_modules/.bin/mocha \
		--require should \
		--timeout 10s

.PHONY: test
