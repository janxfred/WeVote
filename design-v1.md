# design-v1.md

## 1. 概要
本ドキュメントは、要件定義書に基づき、投票アプリケーション「WeVote」のシステム設計を定義するものである。

## 2. システム構成
本アプリケーションは、モダンなWebアプリケーション構成を採用する。
-   **フロントエンド**: シングルページアプリケーション（SPA）として実装し、レスポンシブデザインによりPC・スマートフォンの両デバイスに対応する。
-   **バックエンド**: Pythonを使用し、フロントエンドからのリクエストを処理するAPIサーバーとして実装する。
-   **データベース**: PostgreSQLを使用し、システムのデータを永続化する。
-   **認証**: GoogleのOAuth認証を利用する。

## 3. データベース設計 (ER図)
エンティティ間の関連を以下に示す。
```
[users] 1--* [social_accounts]
   |
   +--* [topics] 1--* [topic_categories] *--1 [categories]
   |      |
   |      +--* [topic_images]
   |      |
   |      `--* [topic_options] 1--* [votes]
   |                                   |
   `-----------------------------------*
```

### テーブル定義

#### 3.1. users (ユーザー)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | ユーザーID | 主キー, 自動採番 |
| `name` | `VARCHAR(30)` | ユーザー名（30文字以内）| NOT NULL |
| `icon_image_url` | `VARCHAR(255)` | アイコン画像のURL | |
| `is_suspended` | `BOOLEAN` | ログイン拒否フラグ（管理者用）| NOT NULL, DEFAULT `false` |
| `created_at` | `DATETIME` | 作成日時 | NOT NULL |
| `updated_at` | `DATETIME` | 更新日時 | NOT NULL |

#### 3.2 social_accounts (ソーシャルアカウント連携)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` |	`ID` |	主キー, 自動採番 |
| `user_id`	| `BIGINT` | ユーザーID	| NOT NULL, 外部キー(users.id)|
| `provider` |	`VARCHAR(50)` |	プロバイダー名 (例: 'google', 'twitter')| NOT NULL, UNIQUE |
| `provider_user_id` | `VARCHAR(255)` |	各プロバイダーでの一意なユーザーID | NOT NULL, UNIQUE |
| `created_at` | `DATETIME` | 作成日時 | NOT NULL |
| `updated_at` | `DATETIME` | 更新日時 | NOT NULL |

#### 3.3. topics (議題)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | 議題ID | 主キー, 自動採番 |
| `user_id` | `BIGINT` | 作成したユーザーのID | NOT NULL, 外部キー(users.id) |
| `title` | `VARCHAR(255)` | 議題のタイトル| NOT NULL |
| `description` | `TEXT` | 議題の説明文|
| `expires_at` | `DATETIME` | 投票受付終了日時（作成から半年後）| NOT NULL |
| `created_at` | `DATETIME` | 作成日時 | NOT NULL |
| `updated_at` | `DATETIME` | 更新日時 | NOT NULL |

#### 3.4. categories (カテゴリ)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | カテゴリID | 主キー, 自動採番 |
| `name` | `VARCHAR(30)` | カテゴリ名 | NOT NULL, UNIQUE |


#### 3.5. topic_categories (議題カテゴリ連携)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `topic_id` | `BIGINT` | 議題ID | 主キー, 外部キー(topics.id) |
| `category_id` | `BIGINT` | カテゴリID | 主キー, 外部キー(categories.id) |

#### 3.6. topic_images (議題画像)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | 画像ID | 主キー, 自動採番 |
| `topic_id` | `BIGINT` | 議題ID | NOT NULL, 外部キー(topics.id) |
| `image_path` | `VARCHAR(255)` | 画像のパス | NOT NULL |
| `display_order` | `INT` | 表示順 | NOT NULL |

#### 3.7. topic_options (議題の選択肢)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | 選択肢ID | 主キー, 自動採番 |
| `topic_id` | `BIGINT` | 議題ID | NOT NULL, 外部キー(topics.id) |
| `option_text` | `VARCHAR(255)` | 選択肢の文言 | NOT NULL |

#### 3.8. votes (投票)
| カラム名 | データ型 | 説明 | 制約 |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | 投票ID | 主キー, 自動採番 |
| `user_id` | `BIGINT` | 投票したユーザーのID | NOT NULL, 外部キー(users.id) |
| `topic_id` | `BIGINT` | 投票された議題のID | NOT NULL, 外部キー(topics.id) |
| `topic_option_id` | `BIGINT` | 投票した選択肢のID | NOT NULL, 外部キー(topic_options.id) |
| `created_at` | `DATETIME` | 作成日時 | NOT NULL |
| `updated_at` | `DATETIME` | 更新日時 | NOT NULL |
*補足: `votes` テーブルの `UNIQUE` 制約により、ユーザーは1つの議題に1回しか投票記録を持てない。投票の変更は不可。

## 4. API設計

### 4.1. ユーザー認証・管理 (`/api/users`)
-   **`GET /api/auth/google`**
    -   **説明**: Google認証ページへリダイレクトする。
-   **`GET /api/auth/google/callback`**
    -   **説明**: Googleからのコールバックを受け、認証処理を行い、セッションを確立する。
-   **`GET /api/users/me`**
    -   **説明**: 現在ログインしているユーザーの情報を取得する。
-   **`PUT /api/users/me`**
    -   **説明**: ログインユーザーのプロフィール（名前、アイコン画像）を更新する。アイコン画像は4MBまでのJPEG, PNG形式のみ許容。
    -   **リクエストボディ**: `{ "name": "新しい名前", "icon_image": (multipart/form-data) }`
-   **`DELETE /api/users/me`**
    -   **説明**: サービスから退会する。
-   **`POST /api/logout`**
    -   **説明**: ログアウトする。

### 4.2. 議題 (`/api/topics`)
-   **`GET /api/topics`**
    -   **説明**: 議題の一覧を取得する。
    -   **クエリパラメータ**:
        -   `category`: "恋愛" or "政治"
        -   `sort`: "new" (投稿日順) or "votes" (投票総数順)
        -   `page`: ページネーションのためのページ番号
-   **`POST /api/topics`**
    -   **説明**: 新しい議題を作成する。
    -   **リクエストボディ**: `{ "title": "...", "description": "...", "category_ids": [1, 2], "image_paths": ["/bucket/img1.png"], "options": ["選択肢A", "選択肢B"] }`
-   **`PUT /api/topics/:id`**
    -   **説明**: 議題を編集する。投稿後5分以内かつ投票数が0の場合のみ成功する。
-   **`DELETE /api/topics/:id`**
    -   **説明**: 自分が作成した議題を削除する。

### 4.3. 投票・結果 (`/api/topics/:id/`)
-   **`POST /api/topics/:id/vote's`**
    -   **説明**: 議題に投票する。すでに投票済みの場合は、選択内容を更新する。
    -   **リクエストボディ**: `{ "option_id": 123 }`
-   **`GET /api/topics/:id/result`**
    -   **説明**: 議題の投票結果を取得する。未投票のユーザーは、投票期限が切れるまでアクセスできない。
    -   **レスポンス例**: `{ "total_votes": 150, "results": [ { "option_id": 123, "option_text": "選択肢A", "votes": 100 }, { "option_id": 124, "option_text": "選択肢B", "votes": 50 } ] }`

### 4.4. マイページ (`/api/users/me`)
-   **`GET /api/users/me/topics`**
    -   **説明**: 自分が作成した議題の一覧を取得する。
-   **`GET /api/users/me/votes`**
    -   **説明**: 自分が投票した議題の一覧を取得する。

### 4.5. 管理者機能 (`/api/admin`)
-   **`DELETE /api/admin/topics/:id`**
    -   **説明**: (管理者) 議題を強制的に削除する。
-   **`PUT /api/admin/users/:id/suspend`**
    -   **説明**: (管理者) 特定のユーザーをログイン拒否状態にする。

### 4.6. 画像アップロードAPI (`/api/images`)
-   **`POST /api/upload-url`**
    -   **説明**: クライアントがオブジェクトストレージにファイルを直接アップロードするための、一時的な署名付きURLを生成して返す。
-   -   **リクエストボディ**: `{ "filename": "image.png", "content_type": "image/png" }`
-   -   **レスポンス**: `{ "upload_url": "https://storage...", "file_path": "/bucket/image.png" }`

## 5. 画面設計
※議題詳細ページとコメント投稿機能は初期リリースでは実装しない。
-   **トップページ (議題一覧画面)**
    -   機能: 議題一覧表示、カテゴリでのフィルタリング、表示順序の切り替え、スクロールによる追加読み込み、議題作成ボタン（ログイン時）。
-   **議題作成画面**
    -   機能: タイトル・説明文の入力、複数のカテゴリ選択、複数の画像添付、任意の選択肢の作成。
-   **マイページ**
    -   機能: プロフィール情報表示、プロフィール編集画面への導線、作成した議題一覧、投票した議題一覧のタブ切り替え。
-   **プロフィール編集画面**
    -   機能: ユーザー名とアイコン画像の編集、退会処理。

## 6. バッチ処理
-   **議題期限切れ処理バッチ**
    -   **実行タイミング**: 1日1回、深夜に実行。
    -   **処理内容**: `topics` テーブルをスキャンし、`expires_at` が現在時刻を過ぎている議題を検出する。該当する議題は、全ユーザーが結果を閲覧できる状態に更新する。

## 7. 画像URLについてのアーキテクチャ詳細
 -  1. 画像データの格納場所:  Amazon S3 や Google Cloud Storage といったオブジェクトストレージサービスを利用。
 -  2. データベースに格納するURLの形式: ストレージサービスのドメイン名を含めない、パス部分のみを格納。
       形式の例: /{bucket_name}/{file_name}
-   3. 画像のアップロード処理: クライアントから直接オブジェクトストレージにアップロードする方式（署名付きURLを利用）を採用。
       処理フロー:
       ユーザーが画像をアップロードしようとすると、フロントエンド（クライアント）はバックエンド（サーバー）にファイル情報（ファイル名、種類など）を送信し、アップロード許可を要求。
       サーバーはリクエストを検証し、問題なければ、特定のファイルを一定時間だけアップロードできる一時的なURL（署名付きURL）を生成し、クライアントに返す。
       クライアントは、その署名付きURLを使って、画像を直接オブジェクトストレージにアップロードする。
       アップロードが完了したら、クライアントは画像のパス (/{bucket_name}/{file_name}) などのメタデータをサーバーに送信し、サーバーがそれをDBに保存。
```