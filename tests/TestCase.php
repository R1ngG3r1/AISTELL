<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Test PHP tidak boleh bergantung pada hasil build frontend. Tanpa ini, @vite di
        // app.blade.php mencari public/build/manifest.json dan puluhan test gagal di CI
        // (checkout bersih tidak punya folder build) walau lolos di komputer yang pernah `npm run build`.
        $this->withoutVite();
    }
}
