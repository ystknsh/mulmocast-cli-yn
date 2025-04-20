前準備
1. セリフを作る(script)
2. scriptごとに、背景イメージ用のprompt作成
3. テキストを分割（字幕用に長い文章をさけるため)
4. 読み上げ時に、誤読しないように一部かなに変換(ttsText)

変換
5. ttsTextを使って読み上げる
6. imagePromptで画像生成
7. 1つのファイルにまとめる

# Step1.

[プロンプト](../prompts/prompt.md)を使って、以下のデータを作る

```json
{
  "title": "(title of this episode)",
  "description": "(short description of this episode)",
  "reference": "(url to the article)",
  "script":[
    {
      "speaker": "Host",
      "text": "Hello and welcome to another episode of 'life is artificial', where we explore the cutting edge of technology, innovation, and what the future could look like.",
    },
    {
      "speaker": "Host",
      "text": "Today, ...",
    }
  ]
}
```

# Step2

各セリフにimagePromptを追加（src/imagep.tsを使用）

```json
{
 "script": [{
  "speaker": "Announcer",
    "text": "米国で活躍するエンジニアが新しい技術やビジネスを分かりやすく解説する、中島聡のLife is beautiful。今日は、アメリカの関税引き上げについての解説です。",
    "imagePrompt": "some prompt"
 }]
}
```

# Step3

セリフの分割（src/split.tsを使用、オプション）

### Step 3.1. scriptのimagePromptを削除しつつ、PodCastScriptのrootにimages(array)を追加

```json
{
 "script": [{
  "speaker": "Announcer",
    "text": "米国で活躍するエンジニアが新しい技術やビジネスを分かりやすく解説する、中島聡のLife is beautiful。今日は、アメリカの関税引き上げについての解説です。",
 }],
 "images": [{
   "imagePrompt": "some prompt"
   "index": 0,
   "image": undefined
 }]
}
```

### Step 3.2. scriptを句読点などで分割。
```json
{
 "script": [{
  "speaker": "Announcer",
    "text": "米国で活躍するエンジニアが新しい技術やビジネスを分かりやすく解説する、",
 },{
  "speaker": "Announcer",
    "text": "中島聡のLife is beautiful。",
 },{
  "speaker": "Announcer",
    "text": "今日は、アメリカの関税引き上げについての解説です。",
 }]
}
```
# Step 4

セリフの修正（src/fixtext.tsを使用、オプション）
ttsTextに修正後のテキストを追加。(読み上げはttsText,字幕はtext)

```json
{
 "script": [{
  "speaker": "Announcer",
    "text": "米国で活躍するエンジニアが新しい技術やビジネスを分かりやすく解説する、",
    "ttstext": "米国で活躍するエンジニアが新しい技術やビジネスを分かりやすく解説する、",
 },{
  "speaker": "Announcer",
    "text": "中島聡のLife is beautiful。",
    "ttStext": "中島聡のLife is beautiful。",
 },{
  "speaker": "Announcer",
    "text": "今日は、アメリカの関税引き上げについての解説です。",
    "ttStext": "今日は、アメリカの関税引き上げについての解説です。",
 }]
}
```

# Step5

(src/main.ts)(音声ファイルを作る)
ttsTextを読み上げる

PosdcastScriptを更新し、ouputに保存

tsで以下を追加
```
{
  filename: string
  script[x].filename = filename + index
  voices: string[]
  ttsAgent: string
  voicemap: Map
}
```
graphaiで以下を追加
```
{
  script[x].duration = duration
}
```
fileWriteAgentでoutputを保存する

# Step6(画像を作る)

(src/images.ts)(imagePromptを使う)

outputファイルに以下を追加
```
    outputJsonData.images = results.map?.output;
```

# Step7(まとめて動画にする)
(src/movie.ts)

更新なし
