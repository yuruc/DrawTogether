from __future__ import unicode_literals

from django.db import models

from django.contrib.auth.models import User

from django.conf import settings

from django.utils import timezone
from webapps.settings import *
import json
from channels import Group


class Player(models.Model):
    user = models.ForeignKey(User, default=None)
    win_games = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)
    friends = models.ManyToManyField(User, default=None, related_name='firends')
    online = models.BooleanField(default=False)
    in_game = models.BooleanField(default=False)


class Image(models.Model):
    image = models.FileField(upload_to='images', blank=True)
    content_type = models.CharField(max_length=50, blank=True)
    user = models.ForeignKey(User, default=None)
    title = models.CharField(max_length=10, blank=True)
    time = models.DateTimeField(auto_now=True)
    num_of_likes = models.IntegerField(default=0)

    class Meta:
        ordering = ['-num_of_likes']


class Like(models.Model):
    user = models.ForeignKey(User, default=None)
    image = models.ForeignKey(Image, default=None)
    status = models.IntegerField(default=0)


class LoggedInUser(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, related_name='logged_in_user')


class Game(models.Model):
    label = models.SlugField(unique=True)
    in_game = models.IntegerField(default=0)
    user_a = models.ForeignKey(User, default=None, null=True, related_name='user_a')
    user_b = models.ForeignKey(User, default=None, null=True, related_name='user_b')
    target_word = models.CharField(max_length=50)
    time_limit = models.IntegerField(default=60)
    time_left = models.IntegerField(default=60)
    win_a = models.IntegerField(default=0)
    win_b = models.IntegerField(default=0)
    turns_guess = models.ForeignKey(User, default=None, null=True, related_name='user_guess')
    turns_draw = models.ForeignKey(User, default=None, null=True, related_name='user_draw')
    total_turns = models.IntegerField(default=0)


# Create your models here.
class Message(models.Model):
    message = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
