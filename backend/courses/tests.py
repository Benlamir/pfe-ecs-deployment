from django.test import TestCase
from .models import Course

class CourseModelTest(TestCase):
    def test_create_course(self):
        course = Course.objects.create(title="Test Course", description="Test Description")
        self.assertEqual(course.title, "Test Course")
        self.assertEqual(str(course), "Test Course")
