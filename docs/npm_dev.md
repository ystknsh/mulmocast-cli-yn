Testing procedure for npm version up

# 1. update version

Update `package.json` to set the version:

```
"version": "0.x.x-alpha" // or "0.x.x-beta"
```

To check current version, visit npm site:
[https://www.npmjs.com/package/mulmocast](https://www.npmjs.com/package/mulmocast)

> [!NOTE] 
> Use `alpha` and `beta` only during testing. Without `alpha` or `beta`, the package will be cached.

# 2. build

```bash
yarn run build
```

# 3. create package

```bash
npm pack
```

# 4. install

```bash
npm install -g ./mulmocast-0.0.x-alpha.tgz
```

# 5. test

## 5.1. Confirm the version:

```bash
mulmo --version
```

Expected output:

```
0.0.x-alpha
```
The result should match the version value set in package.json in Step 1.

## 5.2. Run a sample script:

```bash
mulmo movie docs/scripts/helloworld.yaml -o output/yyyymmdd-test
mulmo pdf scripts/test/test_order.json  --pdf_mode handout -o output/yyyymmdd-test
```

# 6. Restore environment
Install the latest published version from npm to restore your environment:

```bash
npm install -g mulmocast@latest
```
```bash
npm list -g mulmocast
```