# News Module Integration

## Thay đổi

Đã gộp logic của `news-views` và `news-likes` vào trong `NewsModule` để tập trung hóa quản lý bài viết.

## Các module đã xóa

1. **NewsViewsModule** (`src/news-views/`)
2. **NewsLikesModule** (`src/news-likes/`)

## Logic được tích hợp vào NewsService

### Views (Lượt xem)
- `incrementViews(id: number)` - Tăng số lượt xem bài viết

### Likes (Lượt thích)  
- `likeNews(id: number)` - Thích bài viết
- `unlikeNews(id: number)` - Bỏ thích bài viết

### Comments (Bình luận)
- `updateCommentsCount(id: number, count: number)` - Cập nhật số lượng bình luận

## API Endpoints trong NewsController

### Quản lý Views
- `PATCH /news/:id/views` - Tăng số lượt xem

### Quản lý Likes
- `PATCH /news/:id/like` - Thích bài viết
- `PATCH /news/:id/unlike` - Bỏ thích bài viết

### Quản lý Comments
- `PATCH /news/:id/comments-count` - Cập nhật số lượng bình luận

## Repository Methods

Các phương thức trong `NewsRepository`:
- `incrementViews(id: number)` - Tăng views trong DB
- `incrementLikes(id: number)` - Tăng likes trong DB  
- `decrementLikes(id: number)` - Giảm likes trong DB
- `updateCommentsCount(id: number, count: number)` - Cập nhật comments count

## News Entity

Entity `News` đã có sẵn các trường:
```typescript
@Column('int', { default: 0 })
views: number;

@Column('int', { default: 0 })
likes: number;

@Column('int', { default: 0 })
comments_count: number;
```

## Lợi ích

1. **Tập trung hóa**: Tất cả logic news nằm trong 1 module
2. **Đơn giản hóa**: Không cần nhiều module riêng biệt
3. **Hiệu quả**: Ít file hơn, dễ bảo trì hơn
4. **Consistency**: API endpoints thống nhất với prefix `/news`

## Sử dụng

### Tăng lượt xem
```typescript
// POST /news/123/views
await newsService.incrementViews(123);
```

### Thích/Bỏ thích
```typescript
// POST /news/123/like
await newsService.likeNews(123);

// POST /news/123/unlike  
await newsService.unlikeNews(123);
```

### Cập nhật bình luận
```typescript
// POST /news/123/comments-count
await newsService.updateCommentsCount(123, 5);
```
