<?php

// Test ZIP creation
$zip = new ZipArchive;
$zipPath = storage_path('app/test.zip');

// Ensure directory exists
$zipDir = dirname($zipPath);
if (!is_dir($zipDir)) {
    mkdir($zipDir, 0755, true);
}

if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
    $zip->addFromString('test.txt', 'Hello World!');
    $zip->close();
    
    echo "ZIP created successfully at: " . $zipPath . "\n";
    echo "File size: " . filesize($zipPath) . " bytes\n";
} else {
    echo "Failed to create ZIP\n";
    echo "Error code: " . $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) . "\n";
}
