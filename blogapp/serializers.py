from rest_framework import serializers
from .models import BlogPost

class BlogPostSerializer(serializers.ModelSerializer):  # ✅ rename this
    class Meta:
        model = BlogPost
        fields = ['id', 'author', 'title', 'content', 'image', 'created_at']
        read_only_fields = ['author', 'created_at']