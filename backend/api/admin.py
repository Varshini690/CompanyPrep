from django.contrib import admin
from django.contrib.auth.models import User
from .models import Resume, InterviewSetup

# Show extra fields for User in admin
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "date_joined", "is_active")
    search_fields = ("username", "email")
    list_filter = ("is_active", "date_joined")


class ResumeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "file", "uploaded_at")
    search_fields = ("user__username", "user__email")
    list_filter = ("uploaded_at",)


admin.site.unregister(User)      # unregister default User
admin.site.register(User, UserAdmin)
admin.site.register(Resume, ResumeAdmin)
admin.site.register(InterviewSetup)
