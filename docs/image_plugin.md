# Image Plugin

beatのimage プロパティがセットされているとImage Pluginによって画像が生成される

例:
```json
{
  "type": "image",
  "source": {
    "kind": "url",
    "url": "https://raw.githubusercontent.com/receptron/mulmocast-cli/refs/heads/main/assets/images/mulmocast_credit.png"
  }
}
```

pluginの実装はsrc/utils/image_plugins/にある。
pluginを追加する場合は、

- このdirにPluginのソースを追加
- このdirのindex.tsのimagePluginsに追加
- src/types/schema.tsのmulmoImageAssetSchemaに追加


# Image Pluginの実装

Image Pluginは、

```
{
 process: async (params: ImageProcessorParams): void;
 path: (params: ImageProcessorParams): string;
}
```
のinterfaceを持つ。

### path
pathは、生成されるimageのpath.
主に3種類のpathのうちのいずれかを返す。

- paramsでmulmocast共通のimagePathが渡されるので、それをそのまま使う(utils.tsのparrotingImagePath関数)
- type = sourceのときにlocalのimageを参照する場合は、そのpathを返す(source.tsのprocessSource関数)
- pathを返さない( undefinedを返す) そのbeatがデータを持たない特殊なケース。beatのreference, voice over。

### process

実際の画像を生成する関数
paramsを受け取って画像を生成する。
return でimagePathを返しているが、現在は使ってない。（ので、型的にはvoid)