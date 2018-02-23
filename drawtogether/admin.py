from django.contrib import admin
from .models import *


class PlayerImageInline(admin.TabularInline):
    model = Image


class PlayerAdmin(admin.ModelAdmin):
    inlines = [PlayerImageInline, ]


# Register your models here.

admin.site.register(Game)
admin.site.register(Image)
