<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    //Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('dashboard', [ProjectController::class, 'index'])->name('dashboard');
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::put('projects/{projects}',[ProjectController::class, 'update'])->name('projects.update');
    Route::delete('projects/{projects}', [ProjectController::class, 'delete'])->name('projects.delete');
});

require __DIR__.'/settings.php';
