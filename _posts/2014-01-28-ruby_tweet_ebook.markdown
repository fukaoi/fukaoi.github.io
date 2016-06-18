---
layout: post
title: Twitterのお気に入りTweetを電子書籍にするRubyアプリを作った
date: 2014-01-28 15:09:00
description: Created a ruby tool that epub make build twitter favorite article
---
1年以上前に、「TweetEbook」というアプリを作って、ほったらかしにしているのを思いだしました。どういうアプリかというと、タイトルどおりなのですが、 Twitter上で保存してある、お気に入りtweetを、TwitterAPI経由で取得して、epub形式に吐き出して電子書籍にしてくれるというものです。

作ろうと思ったキッカケはepub3の仕様が公開されて、電子書籍をつくってみたかったのと、たまたま当時Twitterのお気に入りの過去ログを振り返っていたら以外に面白かった。「当時、自分でこんなこと言っていたんだ」、「あぁぁ、この人相変わらずおもしろいなぁ」とか。

じゃあ、自分だけのお気に入りツィート集みたいなのができれば、本みたいに読めてちょっと面白いかも、というのが経緯です

このアプリの確認した動作環境は以下のとおりです。Windowsでも動くような、動かないような

> *   Mac OSX Marvericks
> *   Ubuntu12.0.4 Linux
> * ruby1.9.3, 2.1.0 <= 両方ともOK

### お気に入りTweet電子書籍の作成方法

#### 1\. githubからソース一式をダウンロードする

[<u>このgithubリポジトリー</u>](https://github.com/fukaoi/TweetEbook)から、git clone, zipダウンロードなどでTweetEbookのソース一式をダウンロードしてください。

#### 2\. 必要なGemをインストールする

<pre class="prettyprint">bundle install
</pre>

#### 3\. テストを走らせてみる

いちおう走らせてテストケースが全部通るか確認します。ここでコケたら、もしかしたら、必要なGemがはいってなかったり、Versionによる依存問題がおきているかもしれません。その場合はこのブログのコメントから教えてもらえると助かります

<pre class="prettyprint">rake test
</pre>

#### 4\. 設定ファイルにOAuth認証情報を登録する

登録するには、[<u>Twitterのアプリ登録申請のページ</u>](http://twitter.com/oauth_clients/)から、新規アプリを登録してOAuthの必要な情報を取得しておく。その後、editorなどでlib/settings.rbを開いてsetting.rbの'Your xxxxxxx'の箇所を書き換えていってください。

<pre class="prettyprint">
account_name 'Your account name'
consumer_key 'Your consumer_key'
consumer_secret 'Your consumer_secret'
access_token 'Your access_token'
access_token_secret 'Your access_token_secret'
</pre>

変数名は、Twitterのアプリ管理ページにでてくる項目と同じ名称なので、わかりやすいかと思います。

#### 5\. ビルドする

<pre class="prettyprint">rake
</pre>

そうすると、以下のようにカレントディレクトリー内にファイルが出来上がります

> /output/tweet_ebook.epub

#### 6\. epub readerで開いてみる

このファイルをJSで開発された「Readium」で開いてみます。そのときのキャプチャ画像です(※お気に入りTweetは無作為に選びました)。
<div style="margin-bottom:28em">
<div style="float:left; margin-left: 20px;">
  <img src="/img/2014/cover.png" style="width: 300px;"/>
</div>
<div style="float:left; margin-left: 20px;">
  <img src="/img/2014/page.png" style="width: 300px;"/>
</div>
</div>

こんな感じに出力され、「カバーのキャプチャ画像」、「画像下のアカウント名」は、自分のアカウントで使用している画像、アカウント名が埋め込まれます。ページに出力されるデータの種類としては

> *   アカウント名
> *   アカウント画像
> *   自己紹介メッセージ
> *   Tweet内容
> *   Tweet更新日
> *   お気に入りに入れられた数

うまく生成できなかった場合は、githubからDLしてきたフォルダにsample.epubというサンプル用で作成したepubファイルがあるので、それで確認できます

### デザインカスタマイズ方法

このアプリを作るにあたり、デザインの柔軟性を重視したかったので、epub用のgemなどはつかわず、xhtmlとcssを作成してゴリゴリやっています。 そのベースファイルがtemplate/にはいっていますので、こちらのxhtmlとcssを触れば、デザインの変更が容易です。ただしxhtmlはRubyのSlimテンプレートエンジンを使って動的に生成しているので、その*.slimファイルを変更しないといけません。 以下にtemplateディレクトリの中でデザインに関連するファイルを説明しました

<pre class="prettyprint">├── cover.slim ・・・カバーデザイン
├── layout.slim ・・・ヘッダーなど全体の共通レイアウト
├── nav.slim ・・・ナビデザイン
├── OEBPS
│   ├── css
│   │   └── style.css ・・・細かなデザイン制御CSS
│   └── images
│       ├── bk.jpg ・・・ページデザインの背景イメージ
│       ├── book_cover.jpg ・・・カバーの青色のイメージ
└── pages.slim ・・・ページデザイン
</pre>
