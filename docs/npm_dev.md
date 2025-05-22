
# update verion

Update `package.json` to set the version:

```
"version": "0.x.x-alpha" // or "0.x.x-beta"
```

# build

```
yarn run build
```

# create package

```
npm pack
```

# install

```
npm install -g ./mulmocast-0.0.x-alpha.tgz
```

# test

Confirm the version:

```
$ mulmo --version                           
```

Expected output:

```
0.0.x-alpha
```

Run a sample script:

```
mulmo  movie  docs/scripts/helloworld.yaml
```