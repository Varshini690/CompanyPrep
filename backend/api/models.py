from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    extracted_data = models.JSONField(default=dict, blank=True)


    def __str__(self):
        return f"Resume {self.pk} - {self.user.username}"
    
class InterviewSetup(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_role = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20)
    interview_type = models.CharField(max_length=100)
    rounds = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)