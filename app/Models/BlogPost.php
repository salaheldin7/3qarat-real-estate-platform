<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'excerpt',
        'content',
        'author',
        'category',
        'image_url',
        'date',
        'read_time',
        'featured',
        'published',
        'views',
        'meta_title',
        'meta_description',
        'slug'
    ];

    protected $casts = [
        'featured' => 'boolean',
        'published' => 'boolean',
        'views' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = \Str::slug($post->title);
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title')) {
                $post->slug = \Str::slug($post->title);
            }
        });
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Accessors
    public function getExcerptAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        // Auto-generate excerpt from content if not provided
        return \Str::limit(strip_tags($this->content), 150);
    }

    public function getReadTimeAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        // Auto-calculate read time based on content
        $wordCount = str_word_count(strip_tags($this->content));
        $readTime = max(1, ceil($wordCount / 200));
        return $readTime . ' min read';
    }

    // Mutators
    public function setTitleAttribute($value)
    {
        $this->attributes['title'] = $value;
        $this->attributes['slug'] = \Str::slug($value);
    }

    // Helper methods
    public function incrementViews()
    {
        $this->increment('views');
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
