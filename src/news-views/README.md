# News Views API

API để quản lý lượt xem bài viết (news_views) - theo dõi việc người dùng xem các bài viết tin tức.

## Cấu trúc Database

```sql
CREATE TABLE news_views (
    user_id INT,
    news_id INT,
    viewed_at DATETIME,
    PRIMARY KEY (user_id, news_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (news_id) REFERENCES news(id)
);
```

## API Endpoints

### 1. Tạo lượt xem mới
- **POST** `/news-views`
- **Body:**
```json
{
  "user_id": 1,
  "news_id": 1
}
```
- **Response:** Thông tin lượt xem vừa tạo
- **Note:** Mỗi user chỉ có thể xem 1 lần cho mỗi bài viết (unique constraint)

### 2. Lấy tất cả lượt xem
- **GET** `/news-views`
- **Query Parameters (optional):**
  - `user_id`: Lọc theo user ID
  - `news_id`: Lọc theo news ID
  - `from_date`: Lọc từ ngày (YYYY-MM-DD)
  - `to_date`: Lọc đến ngày (YYYY-MM-DD)

### 3. Lấy lịch sử xem của người dùng
- **GET** `/news-views/user/{userId}`
- **Response:** Danh sách tất cả bài viết mà user đã xem

### 4. Lấy lượt xem của bài viết
- **GET** `/news-views/news/{newsId}`
- **Response:** Danh sách tất cả user đã xem bài viết này

### 5. Kiểm tra user đã xem bài viết chưa
- **GET** `/news-views/user/{userId}/news/{newsId}`
- **Response:** Thông tin lượt xem nếu có, 404 nếu chưa xem

### 6. Đếm số lượt xem của bài viết
- **GET** `/news-views/count/news/{newsId}`
- **Response:**
```json
{
  "newsId": 1,
  "viewCount": 150
}
```

### 7. Đếm số bài viết đã xem của user
- **GET** `/news-views/count/user/{userId}`
- **Response:**
```json
{
  "userId": 1,
  "viewCount": 25
}
```

### 8. Xóa lượt xem cụ thể
- **DELETE** `/news-views/user/{userId}/news/{newsId}`

### 9. Xóa tất cả lượt xem của user
- **DELETE** `/news-views/user/{userId}`

### 10. Xóa tất cả lượt xem của bài viết
- **DELETE** `/news-views/news/{newsId}`

## Tích hợp với News Controller

Có thể tích hợp với news controller để tự động tạo lượt xem khi user đọc bài viết:

```typescript
// Trong news.controller.ts
@Get(':id')
async findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query('user_id') userId?: number
): Promise<News> {
  const news = await this.newsService.findOne(id);
  
  // Tự động tạo lượt xem nếu có user_id
  if (userId) {
    try {
      await this.newsViewsService.create({
        user_id: userId,
        news_id: id
      });
    } catch (error) {
      // Ignore conflict error (user đã xem rồi)
    }
  }
  
  return news;
}
```

# News Views API

API để quản lý lượt xem bài viết (news_views) - theo dõi việc người dùng xem các bài viết tin tức.

## Cấu trúc Database

```sql
CREATE TABLE news_views (
    user_id INT,
    news_id INT,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, news_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
);
```

## Tạo bảng Database

### Cách 1: Chạy SQL trực tiếp
Chạy câu lệnh SQL sau trong database của bạn:

```sql
CREATE TABLE news_views (
    user_id INT,
    news_id INT,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, news_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE
);
```

### Cách 2: Để TypeORM tự động tạo (Development)
Thêm `synchronize: true` trong config TypeORM (chỉ dùng cho development):

```typescript
// typeOrm.config.ts
{
  // ... other config
  synchronize: true, // Chỉ dùng cho development
}
```

**Lưu ý:** `synchronize: true` chỉ nên dùng trong môi trường development, không bao giờ sử dụng trong production.

## Module Structure

```
src/news-views/
├── dto/
│   ├── create-news-view.dto.ts
│   └── query-news-view.dto.ts
├── entities/
│   └── news-view.entity.ts
├── news-views.controller.ts
├── news-views.repository.ts
├── news-views.service.ts
└── news-views.module.ts
```

Module đã được thêm vào `app.module.ts` và sẵn sàng sử dụng.
