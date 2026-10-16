<?php

use App\Models\User;
use App\Modules\Notification\Notifications\NewReviewNotification;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Review\Models\Review;
use App\Modules\Service\Models\Service;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

/*
| Rating & ulasan pesanan selesai. Jalankan: php artisan test --filter=ReviewTest
*/

function doneOrder(?User $user = null): Order
{
    return Order::factory()->for($user ?? User::factory()->create())->status(OrderStatus::Selesai)->create();
}

it('pemilik dapat mengulas pesanan yang selesai', function () {
    $order = doneOrder();

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", ['rating' => 5, 'comment' => 'Rapi sekali'])
        ->assertSessionHasNoErrors();

    $review = Review::sole();
    expect($review->order_id)->toBe($order->id)
        ->and($review->user_id)->toBe($order->user_id)
        ->and($review->service_id)->toBe($order->service_id)
        ->and($review->rating)->toBe(5);
});

it('komentar boleh kosong', function () {
    $order = doneOrder();

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", ['rating' => 3])->assertSessionHasNoErrors();

    expect(Review::sole()->comment)->toBeNull();
});

it('rating wajib 1 sampai 5 dan komentar maksimal 1000 karakter', function (array $data, string $field) {
    $order = doneOrder();

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", $data)->assertSessionHasErrors($field);

    expect(Review::count())->toBe(0);
})->with([
    'tanpa rating' => [[], 'rating'],
    'rating 0' => [['rating' => 0], 'rating'],
    'rating 6' => [['rating' => 6], 'rating'],
    'rating bukan angka' => [['rating' => 'bagus'], 'rating'],
    'komentar terlalu panjang' => [['rating' => 4, 'comment' => str_repeat('a', 1001)], 'comment'],
]);

it('pesanan yang belum selesai tidak bisa diulas', function (OrderStatus $status) {
    $order = Order::factory()->status($status)->create();

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", ['rating' => 5])->assertForbidden();
})->with([OrderStatus::Menunggu, OrderStatus::Diproses, OrderStatus::Ditolak, OrderStatus::Dibatalkan]);

it('satu pesanan hanya bisa diulas sekali', function () {
    $order = doneOrder();
    $this->actingAs($order->user)->post("/orders/{$order->id}/review", ['rating' => 5]);

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", ['rating' => 1])->assertForbidden();

    expect(Review::sole()->rating)->toBe(5);
});

it('user lain dan admin tidak bisa mengulas pesanan orang lain', function () {
    $order = doneOrder();

    $this->actingAs(User::factory()->create())->post("/orders/{$order->id}/review", ['rating' => 5])->assertForbidden();
    $this->actingAs(User::factory()->admin()->create())->post("/orders/{$order->id}/review", ['rating' => 5])->assertForbidden();
    auth()->logout();
    $this->post("/orders/{$order->id}/review", ['rating' => 5])->assertRedirect('/login');
});

it('user_id dan service_id dari form diabaikan', function () {
    $order = doneOrder();
    $other = User::factory()->create();

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", [
        'rating' => 4, 'user_id' => $other->id, 'service_id' => Service::factory()->create()->id,
    ]);

    expect(Review::sole())->user_id->toBe($order->user_id)->service_id->toBe($order->service_id);
});

it('detail pesanan user dan admin menyertakan ulasan', function () {
    $review = Review::factory()->create(['rating' => 4, 'comment' => 'Mantap']);
    $order = $review->order;

    $this->actingAs($order->user)->get("/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.review.rating', 4)->where('order.review.comment', 'Mantap'));

    $this->actingAs(User::factory()->admin()->create())->get("/admin/orders/{$order->id}")
        ->assertInertia(fn (Assert $page) => $page->where('order.review.rating', 4));
});

it('halaman layanan menampilkan rata-rata rating dan ulasan dengan nama disingkat', function () {
    $service = Service::factory()->create();
    foreach ([5, 4] as $rating) {
        $user = User::factory()->create(['name' => 'Budi Santoso']);
        $order = Order::factory()->for($user)->for($service)->status(OrderStatus::Selesai)->create();
        Review::factory()->for($order)->create(['rating' => $rating, 'user_id' => $user->id, 'service_id' => $service->id]);
    }

    $this->actingAs(User::factory()->create())->get("/services/{$service->id}")
        ->assertInertia(fn (Assert $page) => $page
            ->where('service.reviews_count', 2)
            ->where('service.reviews_avg_rating', fn ($v) => (float) $v === 4.5)
            ->has('reviews', 2)
            ->where('reviews.0.reviewer', 'Budi S.')
            ->missing('reviews.0.user_id'));

    $this->actingAs(User::factory()->create())->get('/services')
        ->assertInertia(fn (Assert $page) => $page->where('services.0.reviews_count', 2));
});

it('layanan tanpa ulasan tidak punya rata-rata rating', function () {
    $service = Service::factory()->create();

    $this->actingAs(User::factory()->create())->get("/services/{$service->id}")
        ->assertInertia(fn (Assert $page) => $page->where('service.reviews_count', 0)->where('service.reviews_avg_rating', null)->has('reviews', 0));
});

it('admin mendapat notifikasi saat ada ulasan baru', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $order = doneOrder();

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", ['rating' => 2, 'comment' => 'Kurang bersih']);

    Notification::assertSentTo($admin, NewReviewNotification::class);
});

it('ulasan ikut terhapus saat akun pemilik dihapus', function () {
    $review = Review::factory()->create();

    $review->user->delete();

    expect(Review::count())->toBe(0);
});

it('pemilik dapat mengubah ulasannya', function () {
    $review = Review::factory()->create(['rating' => 2, 'comment' => 'Kurang']);
    $order = $review->order;

    $this->actingAs($order->user)->put("/orders/{$order->id}/review", ['rating' => 5, 'comment' => 'Setelah diperbaiki, mantap'])
        ->assertSessionHasNoErrors();

    expect($review->fresh())->rating->toBe(5)->comment->toBe('Setelah diperbaiki, mantap')
        ->and(Review::count())->toBe(1);
});

it('perubahan ulasan divalidasi seperti ulasan baru', function () {
    $review = Review::factory()->create(['rating' => 3]);

    $this->actingAs($review->user)->put("/orders/{$review->order_id}/review", ['rating' => 9])->assertSessionHasErrors('rating');

    expect($review->fresh()->rating)->toBe(3);
});

it('pemilik dapat menghapus ulasannya lalu menulis ulasan baru', function () {
    $review = Review::factory()->create();
    $order = $review->order;

    $this->actingAs($order->user)->delete("/orders/{$order->id}/review")->assertSessionHasNoErrors();
    expect(Review::count())->toBe(0);

    $this->actingAs($order->user)->post("/orders/{$order->id}/review", ['rating' => 4])->assertSessionHasNoErrors();
    expect(Review::count())->toBe(1);
});

it('user lain, admin, dan tamu tidak bisa mengubah atau menghapus ulasan orang lain', function () {
    $review = Review::factory()->create(['rating' => 5]);
    $url = "/orders/{$review->order_id}/review";

    foreach ([User::factory()->create(), User::factory()->admin()->create()] as $intruder) {
        $this->actingAs($intruder)->put($url, ['rating' => 1])->assertForbidden();
        $this->actingAs($intruder)->delete($url)->assertForbidden();
    }

    auth()->logout();
    $this->put($url, ['rating' => 1])->assertRedirect('/login');
    $this->delete($url)->assertRedirect('/login');

    expect($review->fresh()->rating)->toBe(5);
});

it('mengubah atau menghapus pesanan yang belum punya ulasan ditolak', function () {
    $order = doneOrder();

    $this->actingAs($order->user)->put("/orders/{$order->id}/review", ['rating' => 5])->assertForbidden();
    $this->actingAs($order->user)->delete("/orders/{$order->id}/review")->assertForbidden();
});
