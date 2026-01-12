<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->foreignUuid('selected_academic_year_id')->nullable()->constrained('academic_years')->onDelete('set null');
            $table->enum('bulletin_template', ['template1', 'template2', 'template3'])->default('template1');
            $table->string('logo')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('establishments', function (Blueprint $table) {
            $table->dropForeign(['selected_academic_year_id']);
            $table->dropColumn(['selected_academic_year_id', 'bulletin_template', 'logo']);
        });
    }
};
