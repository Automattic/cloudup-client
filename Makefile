
test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require should \
		--slow 2500ms \
		--timeout 30s \
		--bail \
		$(ARGS)

test-streams:
	@make test ARGS=test/stream.js

test-items:
	@make test ARGS=test/item.js

docs:
	@dox --api < lib/client.js
	@dox --api < lib/stream.js
	@dox --api < lib/item.js

.PHONY: test test-streams test-items docs
