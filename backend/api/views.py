from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth.models import User
from .serializers import RegisterSerializer, ResumeSerializer, InterviewSetupSerializer
from .models import Resume, InterviewSetup

from .utils import parse_resume_text_from_fileobj, generate_questions_from_resume


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=201)
        return Response(serializer.errors, status=400)



class ResumeUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("resume")
        if not file:
            return Response({"error": "No resume uploaded"}, status=400)

        resume = Resume.objects.create(user=request.user, file=file)

        file_obj = resume.file.open("rb")
        parsed = parse_resume_text_from_fileobj(file_obj)
        file_obj.close()

        resume.extracted_data = parsed
        resume.save()

        return Response({
            "message": "Resume uploaded & parsed!",
            "data": parsed
        }, status=200)


class InterviewSetupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InterviewSetupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            resume = Resume.objects.filter(user=request.user).last()

            if not resume:
                return Response({"error": "Upload resume first"}, status=400)

            questions = generate_questions_from_resume(
                resume.extracted_data,
                serializer.validated_data["job_role"],
                serializer.validated_data["difficulty"],
                serializer.validated_data["interview_type"],
            )

            return Response({
                "message": "Interview setup saved",
                "questions": questions,
            })

        return Response(serializer.errors, status=400)
