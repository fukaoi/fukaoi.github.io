---
layout: post
title:  Rubyでガード句(節)を導入してメソッドの型チェックを行う
date:   2014-01-25 16:40:16
description: Method type checking that ruby guard sentence
---
Rubyでオブジェクト指向開発を行うときって、オレオレクラスを定義して、その中にいくつかの振る舞いのメソッドを作りますよね。その作成したメソッドに渡され る引数の型とかってチェックしていますか？チェックせずに実行時エラーで処理止めてませんか？例えば簡単な具体例をだすと、以下のような、合計値を求めるメソッドがあったとして

<pre class="prettyprint">
def sum(arr)
    arr.inject(:+)
end
</pre>

このメソッドを作成した開発者の意図は、数値の配列を渡すと合計した値を返してくれる。引数名がarrとなっているので、なんとなく引数に配列型が渡されることは推測できる。

<pre class="prettyprint">sum([1,2,3,4])
# result => 10
</pre>

だけど、大人数のプロジェクトなどではしばしば開発者の意図とは違う使い方起きる、例えば

#### (A).異なる使い方(文字列を含んだ配列)のケース

<pre class="prettyprint">sum(['Hello', 'Ruby', '2014'])
# result => "HelloRuby2014"   
</pre>

文字列の結合にsumメソッドを使ってしまうケース（※正直、文字列の連結にこのメソッドを使うエンジニアなどいるわけないが、たとえ話ということで）。この場合は実行時エラーが発生せず、文字列が生成される。だがこのメソッドの開発者の意図とは異なる使い方をしているので、本来の想定していない引数がセットされた時点で錯誤している開発者にアラートをあげてあるべきでは？

結構問題になるのが、色々なメソッドが呼び出されている中で、どこで発生したかわからないが、nilが渡ってきたケース。

#### (B).nil発生のケース

<pre class="prettyprint">sum(nil)    
</pre>

> sum': undefined methodinject' for nil:NilClass (NoMethodError)

当然 injectの実行時エラーになる。NoMethodError内容をみれば、「あ、ぁnil発生ね」と分かる。だが意図してnilを発生させるケースなんてほとんどないと思う。どこの処理中でnilが発生したのか、「前のメソッドで発生したのか？」、「前の前のメソッドでは発生したのか？」たまたまjnjectのところで、処理がストップしただけで、nilの発生場所が特定できていない。breakpointを設定したりして、nilの発生場所を特定するための泥臭い作業が発生する。ほんと苦痛

で、ようやく本題。 そこで登場するのが、ガード節。早速、sumメソッドにガード節を入れて、**「異なる使い方のケース」、「nil発生のケース」**をガードしてみる。

<pre class="prettyprint">def sum(arr)
    raise 'Array Only!' unless arr.is_a?(Array)
    arr.each{|arr| raise 'Array values only Numeric' unless arr.is_a?(Numeric)}

    arr.inject(:+)
end
</pre>

1行名のガード節で配列以外の引数がセットされることもないし、nilも防ぐ事ができる。2行目のガード節では配列にセットされた値が数値かどうかチェックしている。ここは本来ならinjectの中でやればいいんだけど、あくまでもガード節の説明なので分かりやすく切り離して2行目のガード節としている

「異なる使い方のケース」ではメソッドにコメントを書くことでメソッドの使い方の誤用はある程度は防げるが、汎用的なメソッド以外は極力コメントは書きたくない。コメントの保守も大変だし、保守されなくなったコメントほど、邪魔するものはない。

ここまでチェックすれば、枕を高くして寝れる、、、だが前のシンプルなコードに比べて見づらく可読性が悪くなった。メソッドの信頼性を高めるために引数をチェックして、水際で想定外の値を防ごうとすると可読性が悪くなる。Rubyのシンプルさや可読性が殺されてしまった気がする。しかも全てのメソッドにガード句を追加するのは苦行である

だけど、救世主は以外なところにいたりする、ここからが本題の中核。この矛盾を解決してくれるのがgemの**[Contracts](https://github.com/egonSchiele/contracts.ruby)**だ。簡単にどういう動きをするのか説明すると、条件文で指定したうっとおしいガード節をガード句に置き換えてくれて、**引数**だけでなく、**返り値**の型をチェックもしてくれる。異なる型の引数、返り値が発生すると、Errorオブジェクトがraiseされメソッドの先頭で処理をとめてくれる。型を定義できるなんてちょっと静的言語みたいでしょ？

百聞は一見にしかず、上記sumメソッドにContractsを導入してみる

<pre class="prettyprint">require 'contracts'
include Contracts

Contract ArrayOf[Num] => Num
def sum(arr)
    arr.inject(:+)
end
</pre>

> ArrayOf[Num]

この箇所が、引数の型定義である。

> Num

これが返り値の型定義になる、どうだろうすっきしたでしょ

さっそく、上記ででてきたsum()にnilを渡してみると

<pre class="prettyprint">Contract violation: (ContractError)
Expected: an array of Contracts::Num,
Actual: nil
Value guarded in: Object::sum
With Contract: ArrayOf => Num
At: test.rb:5
</pre>

このようにContractErrorがraiseされ、ガードしてくれる！エラー内容の見方を解説すると

> Expected: an array of Contracts::Num,

これが本来想定される引数の型を表している。ここではArray型の中身はNum型だよと

> Actual: nil

これが実際に渡ってきた値を表している。nilでした

> Value guarded in: Object::sum

これはsumメソッドでガード句が発動したということ

> At: test.rb:5

ガード句が発動されたファイルのライン数

このように、ContractErrorが出力内容も可読性が高く見やすい。せっかくなので、返り値の型を補足したケースも試してみる。定義した数値型(Num)ではなく文字列型(String)がメソッド内で返った場合

<pre class="prettyprint">def sum(arr)
arr.inject(:+)
'This sum return value'
end
</pre>

'This sum return value'という文字列を返すようにすると

<pre class="prettyprint">Contract violation: (ContractError)
Expected: Contracts::Num,
Actual: "This sum return value"
Value guarded in: Object::sum
With Contract: ArrayOf => Num
At: test.rb:5
</pre>

返り値も引数と同じく捕捉してくれた。すばらしい。後は、なにげに便利なのが **Actual** の値。引数値、返り値の中身を中身を出力してくれるので、入れ子構造のHashなどを扱うときは重宝する。たとえば、以下のようなメソッドの場合

<pre class="prettyprint">Contract ({profile:{first_name: String, last_name: String, age: Num}}) => String
def celebrate_message(profile)
  "Congratulation! #{profile[:fist_name]}"
end
</pre>

profile:{first_name: String, last_name: String, age: Num}} というHash構造を引数に渡すメソッド仕様のケースでミスをした場合には

<pre class="prettyprint">Expected: {:profile=>{:first_name=>String, :last_name=>String, :age=>Contracts::Num}},
Actual: {:profile=>{:first_name=>"fukaoi", :last_name=>"fukaoi"}}
</pre>

という風に、実際の値と比較できて、デバッグがやりやすい。実際に重要なのはExpectedとAcutualの値内容になる
もっと色々な型定義ができるので興味がある人は、ここの[チュートリアル](http://egonschiele.github.io/contracts.ruby/)を見てほしい。[contracts.coffee](http://disnetdev.com/contracts.coffee/)にインスパイアされたとのこと
使う際の注意点として、ライブラリー名、モジュール名は複数形(Contracts)になるけど、メソッドにアノテーション定義する際は単数形(Contract)になるので、最初はよく間違えた

#### メリット

> *   メソッドの引数、返り値をチェックして開発者の意図した動作を保証してくれる
> *   RailsのController、Model、libでも問題なく動いた
> *   異常値が発生した場合、発生したメソッド内で、捕捉できるので、Bugの早期発見が可能
> *   メソッドの振る舞いがContractの定義内容からわかるので、メソッドドキュメントの代わりにもなる
> *   ContractErrorで引っかかるたびに、自分がクラスの守護神みたいに感じてきて、偉くなった気分を味わえる

#### デメリット

> *   なんか色々やっていそうなのでパフォーマンスはどうなのか気になる所。今度ベンチマークをとってみよう

文頭では挑発的に「チェックせずに実行時エラーで処理止めてませんか？」なんて書いてみたけど、ブログを書いているうちに、結局は動的言語で型をチェックすべきかどうかは、好き好みかなーと思ってきた。現にガードしていないライブラリ、モジュールなんて腐るほどあるし、実行時エラーでなんとかなっている。自分はきっと、Rubyも好きだけど、静的言語も好きなので、良いと思えれるイディオムがあれば、どんどん取り入れたい派なんだなーと改めて再認識した。それでもContractsのおかげで、Bugの早期発見率があがり、精神的ストレスが下がり、夜ぐっすり眠れるようになったのはまぎれもない事実だよ。
