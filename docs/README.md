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
