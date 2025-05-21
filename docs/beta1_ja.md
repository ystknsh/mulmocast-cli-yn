# MulmoCast 0.1.x/Beta：Release Note

## ベータ版を使う際に、最低限必要なもの

1. MacOS走るパソコン（Linux、Windowsでの動作は未確認です）
2. Terminalアプリでの操作に慣れていること
3. nodeおよびbrewが既にインストールされていること
4. OpenAIの開発者向けのアカウントを持つこと

## 環境設定

### 必須項目

1. ```npm install -g mulmocast``` で mulmocast をインストール
2. ```brew install ffmpeg``` で ffmpeg をインストール
3. OpenAIからAPIキーを取得（sk-XXXX という形式）
3. 作業用のフォルダーを決め、そこに .env というテキストファイルを作り、そこに、```OPENAI_API_KEY=sk-XXXX```の１行を追加（XXXXの部分はアカウントごとに異なります）

### 推奨項目（綺麗な絵を生成するために必要）
4. OpenAIのSettings/Organization/Generalに、Verificationというセクションがあるので、そこで個人認証をする
5. 認証後、.envファイルに```DEFAULT_OPENAI_IMAGE_MODEL=gpt-image-1```の１行を追加

