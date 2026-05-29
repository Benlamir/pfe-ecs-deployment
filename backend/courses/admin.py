from django.contrib import admin
from .models import Course, Establishment, Enrollment

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'establishment', 'status', 'start_date', 'registration_open_date')
    list_filter = ('status', 'establishment')
    search_fields = ('title', 'description')

@admin.register(Establishment)
class EstablishmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'manager')
    search_fields = ('name', 'code')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'course', 'status', 'application_date')
    list_filter = ('status', 'course')
    search_fields = ('candidate__email', 'course__title')
