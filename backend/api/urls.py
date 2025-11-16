from django.urls import path
from .views import InterviewSetupView, RegisterView, ResumeUploadView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
   
    
    # auth
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("resume/upload/", ResumeUploadView.as_view(), name="resume-upload"),
    path("interview/setup/", InterviewSetupView.as_view(), name="interview-setup"),
]
