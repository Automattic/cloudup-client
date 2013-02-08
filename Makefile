
test:
	@./node_modules/.bin/mocha \
		--reporter spec \
		--require should \
		--slow 500ms \
		--timeout 30s \
		$(ARGS)

test-collections:
	@make test ARGS=test/collection.js

test-items:
	@make test ARGS=test/item.js

.PHONY: test test-collections test-items
