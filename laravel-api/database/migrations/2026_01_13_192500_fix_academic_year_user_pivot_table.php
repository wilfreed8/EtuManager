<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The pivot table should not have its own 'id' when used with belongsToMany.
        // Laravel inserts only (academic_year_id, user_id, timestamps). If 'id' is required, MySQL throws 1364.
        // We fix safely by recreating the table with a composite primary key.

        if (!Schema::hasTable('academic_year_user')) {
            return;
        }

        if (!Schema::hasColumn('academic_year_user', 'id')) {
            // Already fixed.
            return;
        }

        Schema::create('academic_year_user_new', function (Blueprint $table) {
            $table->foreignUuid('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->primary(['academic_year_id', 'user_id']);
            $table->index(['user_id', 'academic_year_id']);
        });

        // Copy existing rows (ignore the old 'id')
        DB::statement('INSERT IGNORE INTO academic_year_user_new (academic_year_id, user_id, created_at, updated_at) SELECT academic_year_id, user_id, created_at, updated_at FROM academic_year_user');

        Schema::drop('academic_year_user');
        Schema::rename('academic_year_user_new', 'academic_year_user');
    }

    public function down(): void
    {
        // No automatic rollback to the broken schema.
    }
};
