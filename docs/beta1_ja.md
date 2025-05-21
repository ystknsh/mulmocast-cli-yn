# MulmoCast 0.1.x/Beta：Release Note

## ベータ版を使う際に、最低限必要なもの

1. MacOS走るパソコン（Linux、Windowsでの動作は未確認です）
2. Terminalアプリでの操作に慣れていること
3. テキストエディターが使えること（Visual Studio、Emacs、など）
4. nodeおよびbrewが既にインストールされていること
5. ChatGPTのアカウントを持つこと(無料のアカウントでも可)
6. OpenAIの開発者向けのアカウントを持つこと（従量課金のAPIを使います）

## 環境設定

### 必須項目

1. ```npm install -g mulmocast``` で mulmocast をインストール
2. ```brew install ffmpeg``` で ffmpeg をインストール
3. OpenAIの[開発者向けのページ](https://platform.openai.com/settings/organization/api-keys)でAPIキーを取得（sk-XXXX という形式）
3. 作業用のフォルダーを決め、そこに .env というテキストファイルを作り、そこに、```OPENAI_API_KEY=sk-XXXX```の１行を追加（XXXXの部分はアカウントごとに異なります）

### 推奨項目（綺麗な絵を生成するために必要）
4. OpenAIの開発者向けの[Settings/Organization/General](https://platform.openai.com/settings/organization/general)に、Verificationというセクションがあるので、そこで個人認証をする
5. 認証後、.envファイルに```DEFAULT_OPENAI_IMAGE_MODEL=gpt-image-1```の１行を追加

## コミックスタイルの動画作成

### 基本操作

1. 映像化したいWebページのURLを（クリップボードに）コピー
2. ChatGPTで新たなチャットセッションをスタートして、そのURLの記事を読むように指示（例："read this article, https://..."）
3. ターミナル画面に行き、```mulmo prompt -t comic_strips```と入力（必要なプロントが表示されますが、同時にクリップポードにコピーされます）
4. ChatGPTの画面に戻り、プロンプトをペースト
5. ChatGPTがスクリプトを生成するのを待ち、完了したらそれをコピー（コピーボタンはスクリプトの右上にあります。
6. ターミナル画面に戻り、```mulmo movie __clipboard```と入力（アンダーラインは二つ）

環境設定が正しく行われていれば、これで動画の生成が始まります。動画の作成には、通常4分ほどかかります。

生成された動画は、ステップ６を実行したフォルダーの中にoutputというフォルダーの中に作られます。ファイル名は、```script_20250521_054059```のように作成した日時から決まります。

## 日本語版の映像の作成

日本語の字幕付きのものを作るには、上の操作で作られた映像のファイルネームを元に、```mulmo movie script_xxxxxxxx_xxxx.json -c ja```とターミナルで入力します（script_xxxxxxxx_xxxの部分は上の操作で作られた動画ファイルの名称を入力します）。outputフォルダーに"__ja"というサフィックス付いた動画ファイルが作成されます（アンダーラインは二つ）。

音声も日本語に翻訳したものが欲しい場合には、```mulmo movie script_xxxxxxxx_xxxx.json -l ja```と入力します。outputフォルダーに"_ja"というサフィックス付いた動画ファイルが作成されます（アンダーラインは一つ）。

## ジブリ風のコミック映像作成

ジブリ風のコミック映像を作りたい場合、上の基本操作のステップ３で```mulmo prompt -t ghibli_strips```と入力すると、ジブリ風の映像を作成するためのプロンプトが生成されます。

ただし、ジブリ風の画像の生成に関しては、OpenAI側のポリシーが揺れており、日によって、「コンテンツ・ポリシーに反する」という理由で失敗することがあるので、ご了承ください。