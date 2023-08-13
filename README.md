# cargo-lambda
Serverless plugin for [Cargo Lambda](https://www.cargo-lambda.info/)


### Install

```shell
npm i cargo-lambda --save-dev
```

Add the plugin to your `serverless.yml`

```yaml
plugins:
  - cargo-lambda
```

### Configure

```yaml
functions:
  hello:
  handler: bootstrap
  runtime: 'provided.al2'
  cargo:
     path: 'target/lambda/hello/bootstrap'
  package:
     individually: true
     exclude:
       - '**/**'
     include:
       - 'target/lambda/hello/bootstrap'
```

**Cargo.toml**

```toml
[[bin]]
name = "hello"
path = "src/hello.rs"
```

For your **GitHub Action** you need to just build the functions with `cargo lambda build --release`,
the plugin then will pickup those binaries and will package them at the root level, so that
when AWS Lambda looks for `bootstrap` binaries will find your corresponding functions.

```yaml
- name: Cache cargo registry
	uses: actions/cache@v3
	continue-on-error: false
		with:
			path: |
				~/.cargo/registry
				~/.cargo/git
			key: cargo-build-cache

- name: Release lambda
	run: |
		pip install cargo-lambda
		cargo lambda build --release
```

For the structure of your `hello` rust function you should follow the documentation of
[ Cargo Lambda ](https://www.cargo-lambda.info/)
