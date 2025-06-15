# FAQ

## 多言語対応について

### Q: 英語の動画に後から日本語の音声と字幕を追加できますか？

**A: はい、可能です。以下の手順で効率的に多言語版を作成できます。**

**ファイル構成**:
- **入力**: `your_script.json` (元のMulmoScriptファイル)
- **作業データ**: `output/your_script_studio.json` (自動生成・編集対象)
- **出力**: 
  - `output/your_script.mp4` (英語版)
  - `output/your_script_ja.mp4` (`-l ja`のみの場合)
  - `output/your_script__ja.mp4` (`-c ja`のみの場合)
  - `output/your_script_ja__ja.mp4` (`-l ja -c ja`の場合)

```bash
# 1. 英語版を作成（画像生成も含む）
mulmo movie your_script.json

# 2. 日本語音声・字幕版を作成（画像は再利用）
mulmo movie your_script.json -l ja -c ja
```

**注**: `your_script.json`は実際のファイル名に置き換えてください

### Q: `mulmo movie`コマンドの`-l ja`と`-c ja`オプションの違いは何ですか？

**A: どちらも翻訳処理を自動実行しますが、それぞれ異なる機能を制御します。**

- **`mulmo movie your_script.json -l ja`**: 翻訳処理 + 日本語音声の生成
- **`mulmo movie your_script.json -c ja`**: 翻訳処理 + 日本語字幕の生成
- **`mulmo movie your_script.json -l ja -c ja`**: 翻訳処理 + 日本語音声・字幕の両方

```bash
# 翻訳のみ実行したい場合
mulmo translate your_script.json
```

### Q: 翻訳結果を手動で修正したい場合はどうすればよいですか？

**A: `output/your_script_studio.json`ファイルの`multiLingualTexts.ja.text`を編集してください。**

```json
{
  "multiLingual": [
    {
      "multiLingualTexts": {
        "ja": {
          "text": "修正したい日本語テキスト",  // ← この部分を変更
          "texts": ["修正したい", "日本語テキスト"],
          "ttsTexts": ["修正したい", "日本語テキスト"]
        }
      }
    }
  ]
}
```

**手動修正後の再実行**:
```bash
mulmo movie your_script.json -l ja -c ja
```

**重要**: 元の`your_script.json`を変更しなければ、手動修正した翻訳データは保持され、LLM翻訳はスキップされます。

### Q: 音声と字幕はどのテキストを使用しますか？

**A: どちらも`multiLingualTexts.ja.text`を使用します。**

- **音声生成**: `multiLingualTexts.ja.text`
- **字幕生成**: `multiLingualTexts.ja.text`